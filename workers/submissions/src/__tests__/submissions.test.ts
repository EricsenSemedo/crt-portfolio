// @vitest-environment node
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import worker, { type D1Database, type Env } from "../index";
import { escapeHtml, renderPage, type Submission } from "../page";

const TEAM = "https://cranium.cloudflareaccess.com";
const AUD = "aud-tag";
const ORIGIN = "https://cranium-submissions.example.workers.dev";

const row: Submission = {
  id: 3, created_at: "2026-11-07T02:50:00Z", name: "Dana <script>", business: "Dana's Bakery", reply: "dana@example.com",
  message: "I need a site.\nSoon.", page: "#/websites", status: "new", email_status: "failed",
};

let keys: CryptoKeyPair;
let publicJwk: JsonWebKey;

function base64Url(bytes: Uint8Array | string) {
  const raw = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function token(claims: Record<string, unknown>) {
  const head = base64Url(JSON.stringify({ alg: "RS256", kid: "k1" }));
  const body = base64Url(JSON.stringify({ aud: [AUD], iss: TEAM, exp: Math.floor(Date.now() / 1000) + 600, email: "ericsen@cranium.studio", ...claims }));
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keys.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${base64Url(new Uint8Array(signature))}`;
}

function fakeDb() {
  const updates: unknown[][] = [];
  const db: D1Database = {
    prepare(query) {
      return {
        bind(...values) {
          return {
            async all<T>() {
              const results = query.includes("GROUP BY") ? [{ status: "new", total: 1 }] : [row];
              return { results: results as T[] };
            },
            async run() {
              updates.push(values);
              return {};
            },
          };
        },
      };
    },
  };
  return { db, updates };
}

function env(db: D1Database, overrides: Partial<Env> = {}): Env {
  return { DB: db, ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, TIME_ZONE: "America/New_York", ...overrides };
}

async function request(path: string, jwt: string | null, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (jwt) headers.set("Cf-Access-Jwt-Assertion", jwt);
  return new Request(`${ORIGIN}${path}`, { ...init, headers });
}

beforeAll(async () => {
  keys = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]) as CryptoKeyPair;
  publicJwk = await crypto.subtle.exportKey("jwk", keys.publicKey);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubCerts() {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ keys: [{ ...publicJwk, kid: "k1" }] })));
}

describe("submissions page access", () => {
  it("shows the page to a valid Access session", async () => {
    stubCerts();
    const response = await worker.fetch(await request("/", await token({})), env(fakeDb().db));
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Dana &#60;script&#62;");
    expect(html).not.toContain("<script>");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("refuses a missing, foreign, expired or forged token, and stays shut until Access is configured", async () => {
    stubCerts();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { db } = fakeDb();
    expect((await worker.fetch(await request("/", null), env(db))).status).toBe(403);
    expect((await worker.fetch(await request("/", await token({ aud: ["other-app"] })), env(db))).status).toBe(403);
    expect((await worker.fetch(await request("/", await token({ exp: 1 })), env(db))).status).toBe(403);
    const forged = (await token({})).replace(/\.[^.]+$/, ".AAAA");
    expect((await worker.fetch(await request("/", forged), env(db))).status).toBe(403);
    expect((await worker.fetch(await request("/", await token({})), env(db, { ACCESS_AUD: "" }))).status).toBe(403);
  });
});

describe("changing a status", () => {
  async function post(origin: string, fields: Record<string, string>) {
    return request("/status", await token({}), { method: "POST", headers: { Origin: origin }, body: new URLSearchParams(fields) });
  }

  it("moves a submission and returns to the list it came from", async () => {
    stubCerts();
    const { db, updates } = fakeDb();
    const response = await worker.fetch(await post(ORIGIN, { id: "3", status: "replied", back: "new" }), env(db));
    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toBe(`${ORIGIN}/?status=new`);
    expect(updates).toEqual([["replied", 3]]);
  });

  it("ignores posts from other sites and unknown statuses", async () => {
    stubCerts();
    const { db, updates } = fakeDb();
    expect((await worker.fetch(await post("https://evil.example", { id: "3", status: "archived" }), env(db))).status).toBe(403);
    expect((await worker.fetch(await post(ORIGIN, { id: "3", status: "deleted" }), env(db))).status).toBe(400);
    expect(updates).toEqual([]);
  });
});

describe("renderPage", () => {
  it("escapes text and flags a failed email copy", () => {
    expect(escapeHtml(`"<a>'&`)).toBe("&#34;&#60;a&#62;&#39;&#38;");
    const html = renderPage([row], { new: 1, replied: 0, archived: 0 }, "new", "America/New_York");
    expect(html).toContain('href="mailto:dana@example.com"');
    expect(html).toContain("didn't send");
    expect(renderPage([], { new: 0, replied: 0, archived: 0 }, "archived", "UTC")).toContain("Nothing archived yet.");
  });
});
