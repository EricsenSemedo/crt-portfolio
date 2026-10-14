import { buildInquiryEmail, parseInquiry } from "./inquiry";

export interface Env {
  ALLOWED_ORIGINS: string;
  INQUIRY_TO: string;
  INQUIRY_FROM: string;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";

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
  const response = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form });
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

    // Bots fill the hidden "website" field; they get a normal answer and nothing is sent.
    if (typeof body.website === "string" && body.website) return json({ ok: true }, 200, cors);

    const parsed = parseInquiry(body);
    if ("error" in parsed) return json({ ok: false, error: parsed.error }, 400, cors);
    if (!await passesTurnstile(body.turnstileToken, request, env)) return json({ ok: false, error: "turnstile" }, 403, cors);

    const email = buildInquiryEmail(parsed.inquiry);
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
    if (!sent.ok) {
      console.error("Resend rejected the inquiry", sent.status, await sent.text());
      return json({ ok: false, error: "send" }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  },
};
