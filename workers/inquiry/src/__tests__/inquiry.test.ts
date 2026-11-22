// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "../index";
import { buildInquiryEmail, normalizeSite, parseInquiry } from "../inquiry";

const env: Env = {
  ALLOWED_ORIGINS: "https://ericsensemedo.github.io",
  INQUIRY_TO: "ericsen@cranium.studio",
  INQUIRY_FROM: "Site <inquiry@form.cranium.studio>",
  TURNSTILE_SECRET: "turnstile-secret",
  RESEND_API_KEY: "resend-key",
};

const valid = { name: "Dana", business: "Dana's Bakery", reply: "dana@example.com", message: "I need a site.", page: "#/websites", turnstileToken: "token" };

function post(body: unknown, origin = "https://ericsensemedo.github.io") {
  return new Request("https://cranium-inquiry.example.workers.dev/", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stubFetch(turnstileSuccess: boolean, resendOk = true) {
  const fetchMock = vi.fn(async (url: string) => url.includes("turnstile")
    ? Response.json({ success: turnstileSuccess })
    : new Response("{}", { status: resendOk ? 200 : 500 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("parseInquiry", () => {
  it("requires a name, a way to reply and a message", () => {
    expect(parseInquiry({ ...valid, reply: "  " })).toEqual({ error: "reply" });
    expect(parseInquiry({ ...valid, message: "x".repeat(5001) })).toEqual({ error: "message" });
    expect(parseInquiry(null)).toEqual({ error: "body" });
  });

  it("flattens line breaks in one-line fields", () => {
    const parsed = parseInquiry({ ...valid, name: "Dana\r\nBcc: x@y.z" });
    expect("inquiry" in parsed && parsed.inquiry.name).toBe("Dana Bcc: x@y.z");
  });
});

describe("current site", () => {
  it("is optional", () => {
    const parsed = parseInquiry(valid);
    expect("inquiry" in parsed && parsed.inquiry.currentSite).toBe("");
  });

  it("accepts a bare domain or a full link and stores a full address", () => {
    expect(normalizeSite("danasbakery.com")).toBe("https://danasbakery.com/");
    expect(normalizeSite("http://www.danas-bakery.co.uk/menu")).toBe("http://www.danas-bakery.co.uk/menu");
    const parsed = parseInquiry({ ...valid, currentSite: " danasbakery.com " });
    expect("inquiry" in parsed && parsed.inquiry.currentSite).toBe("https://danasbakery.com/");
  });

  it("rejects anything that isn't a web address", () => {
    for (const bad of ["not a site", "javascript:alert(1)", "ftp://danasbakery.com", "localhost", "https://user:pw@danasbakery.com", "danasbakery"]) {
      expect(parseInquiry({ ...valid, currentSite: bad })).toEqual({ error: "currentSite" });
    }
    expect(parseInquiry({ ...valid, currentSite: `${"a".repeat(300)}.com` })).toEqual({ error: "currentSite" });
  });
});

describe("buildInquiryEmail", () => {
  it("replies to an email address but not to a phone number", () => {
    const parsed = parseInquiry(valid);
    if (!("inquiry" in parsed)) throw new Error("expected a valid inquiry");
    const email = buildInquiryEmail(parsed.inquiry);
    expect(email.subject).toBe("Website inquiry from Dana (Dana's Bakery)");
    expect(email.replyTo).toBe("dana@example.com");
    expect(email.text).toContain("I need a site.");
    expect(email.text).toContain("Current site: -");
    expect(buildInquiryEmail({ ...parsed.inquiry, currentSite: "https://danasbakery.com/" }).text).toContain("Current site: https://danasbakery.com/");
    expect(buildInquiryEmail({ ...parsed.inquiry, reply: "401-555-0100" }).replyTo).toBeUndefined();
    expect(buildInquiryEmail({ ...parsed.inquiry, reply: "dana@example.com;" }).replyTo).toBeUndefined();
  });
});

describe("inquiry worker", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends a verified inquiry to the inbox", async () => {
    const fetchMock = stubFetch(true);
    const response = await worker.fetch(post({ ...valid, currentSite: "danasbakery.com" }), env);
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://ericsensemedo.github.io");
    const [, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    const sent = JSON.parse(init.body as string);
    expect(sent).toMatchObject({ to: ["ericsen@cranium.studio"], reply_to: "dana@example.com" });
    expect(sent.text).toContain("Current site: https://danasbakery.com/");
  });

  it("sends nothing when Turnstile fails, the origin is unknown, or the honeypot is filled", async () => {
    const fetchMock = stubFetch(false);
    expect((await worker.fetch(post(valid), env)).status).toBe(403);
    expect((await worker.fetch(post(valid, "https://evil.example"), env)).status).toBe(403);
    expect((await worker.fetch(post({ ...valid, website: "spam.example" }), env)).status).toBe(200);
    expect(fetchMock.mock.calls.every(([url]) => !String(url).includes("resend"))).toBe(true);
  });

  it("rejects a JSON body that isn't an object", async () => {
    stubFetch(true);
    expect(await (await worker.fetch(post(null), env)).json()).toEqual({ ok: false, error: "body" });
  });

  it("reports an unreachable mail service as a failed send", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("turnstile")) return Response.json({ success: true });
      throw new TypeError("network down");
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await (await worker.fetch(post(valid), env)).json()).toEqual({ ok: false, error: "send" });
  });

  it("reports a failed send so the form can offer another way", async () => {
    stubFetch(true, false);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await worker.fetch(post(valid), env);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: "send" });
  });
});
