import { buildInquiryEmail, parseInquiry, type Inquiry } from "./inquiry";

/** The slice of Cloudflare's D1 binding this Worker uses (keeps @cloudflare/workers-types out). */
export interface D1Database {
  prepare(query: string): { bind(...values: unknown[]): { run(): Promise<{ meta: { last_row_id: number } }> } };
}

export interface Env {
  ALLOWED_ORIGINS: string;
  INQUIRY_TO: string;
  INQUIRY_FROM: string;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  DB?: D1Database;
  // Optional secrets: a Claude Code routine's API trigger, fired once per saved inquiry.
  NOTIFY_URL?: string;
  NOTIFY_TOKEN?: string;
}

interface Context {
  waitUntil(promise: Promise<unknown>): void;
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";
const ROUTINE_API_VERSION = "2023-06-01";

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((entry) => entry.trim());
  if (!allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: object, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

async function passesTurnstile(token: unknown, request: Request, env: Env) {
  if (typeof token !== "string" || !token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form });
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
}

/** Saves the inquiry first; returns its id, or null when the database is missing or fails. */
async function saveInquiry(inquiry: Inquiry, env: Env) {
  if (!env.DB) return null;
  try {
    const result = await env.DB
      .prepare("INSERT INTO inquiries (name, business, reply, message, page) VALUES (?, ?, ?, ?, ?)")
      .bind(inquiry.name, inquiry.business, inquiry.reply, inquiry.message, inquiry.page)
      .run();
    return result.meta.last_row_id;
  } catch (error) {
    console.error("Could not save the inquiry", error);
    return null;
  }
}

async function recordEmail(id: number, sent: boolean, env: Env) {
  try {
    await env.DB?.prepare("UPDATE inquiries SET email_status = ? WHERE id = ?").bind(sent ? "sent" : "failed", id).run();
  } catch (error) {
    console.error("Could not record the email result", error);
  }
}

async function emailInquiry(inquiry: Inquiry, env: Env) {
  const email = buildInquiryEmail(inquiry);
  try {
    const sent = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.INQUIRY_FROM,
        to: [env.INQUIRY_TO],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
    });
    if (!sent.ok) console.error("Resend rejected the inquiry", sent.status, await sent.text());
    return sent.ok;
  } catch (error) {
    console.error("Could not reach Resend", error);
    return false;
  }
}

/** Wakes Claude once per saved inquiry. Only the id is sent; the visitor's words stay in the database. */
async function notifyClaude(id: number, env: Env) {
  if (!env.NOTIFY_URL || !env.NOTIFY_TOKEN) return;
  try {
    const fired = await fetch(env.NOTIFY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.NOTIFY_TOKEN}`, "anthropic-version": ROUTINE_API_VERSION, "Content-Type": "application/json" },
      body: JSON.stringify({ text: `New website inquiry #${id} saved in the cranium-inquiries database.` }),
    });
    if (!fired.ok) console.error("Claude routine trigger failed", fired.status, await fired.text());
  } catch (error) {
    console.error("Could not reach the Claude routine trigger", error);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx?: Context): Promise<Response> {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: cors["Access-Control-Allow-Origin"] ? 204 : 403, headers: cors });
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405, cors);
    if (!cors["Access-Control-Allow-Origin"]) return json({ ok: false, error: "origin" }, 403, cors);

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "body" }, 400, cors);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ ok: false, error: "body" }, 400, cors);

    // Bots fill the hidden "website" field; they get a normal answer and nothing is sent.
    if (typeof body.website === "string" && body.website) return json({ ok: true }, 200, cors);

    const parsed = parseInquiry(body);
    if ("error" in parsed) return json({ ok: false, error: parsed.error }, 400, cors);
    if (!await passesTurnstile(body.turnstileToken, request, env)) return json({ ok: false, error: "turnstile" }, 403, cors);

    const id = await saveInquiry(parsed.inquiry, env);
    if (id !== null) {
      const notified = notifyClaude(id, env);
      if (ctx) ctx.waitUntil(notified);
      else await notified;
    }
    const emailed = await emailInquiry(parsed.inquiry, env);
    if (id !== null) await recordEmail(id, emailed, env);
    // A saved inquiry is safe even when the email fails; only a total loss is reported to the visitor.
    if (id === null && !emailed) return json({ ok: false, error: "send" }, 502, cors);
    return json({ ok: true }, 200, cors);
  },
};
