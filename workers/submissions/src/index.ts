import { verifyAccess } from "./access";
import { renderPage, STATUSES, type Status, type Submission } from "./page";

/** The slice of Cloudflare's D1 binding this Worker uses (keeps @cloudflare/workers-types out). */
export interface D1Database {
  prepare(query: string): {
    bind(...values: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
}

export interface Env {
  DB: D1Database;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  TIME_ZONE: string;
}

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex",
};

function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

function text(body: string, status: number) {
  return new Response(body, { status, headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
}

async function showPage(url: URL, env: Env) {
  const requested = url.searchParams.get("status");
  const current: Status = isStatus(requested) ? requested : "new";
  const [items, counted] = await Promise.all([
    env.DB.prepare("SELECT * FROM inquiries WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 200").bind(current).all<Submission>(),
    env.DB.prepare("SELECT status, COUNT(*) AS total FROM inquiries GROUP BY status").bind().all<{ status: Status; total: number }>(),
  ]);
  const counts: Record<Status, number> = { new: 0, replied: 0, archived: 0 };
  for (const row of counted.results) if (isStatus(row.status)) counts[row.status] = row.total;
  return new Response(renderPage(items.results, counts, current, env.TIME_ZONE || "America/New_York"), {
    headers: { ...SECURITY_HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
}

async function changeStatus(request: Request, url: URL, env: Env) {
  // Only this page's own buttons may change a status.
  if (request.headers.get("Origin") !== url.origin) return text("Forbidden", 403);
  const form = await request.formData();
  const id = Number(form.get("id"));
  const status = form.get("status");
  const back = form.get("back");
  if (!Number.isInteger(id) || id < 1 || !isStatus(status)) return text("Bad request", 400);
  await env.DB.prepare("UPDATE inquiries SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?").bind(status, id).run();
  return new Response(null, { status: 303, headers: { ...SECURITY_HEADERS, Location: `${url.origin}/?status=${isStatus(back) ? back : status}` } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!await verifyAccess(request, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD)) return text("Sign in through Cloudflare Access to see this page.", 403);
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/") return showPage(url, env);
    if (request.method === "POST" && url.pathname === "/status") return changeStatus(request, url, env);
    return text("Not found", 404);
  },
};
