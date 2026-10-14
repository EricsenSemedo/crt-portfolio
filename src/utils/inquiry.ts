// Sends the Websites form to the inquiry Worker (workers/inquiry), which emails it on.
export const INQUIRY_URL = "https://cranium-inquiry.ericsen-semedo.workers.dev/";
// Public by design: the Worker checks the matching secret.
export const TURNSTILE_SITE_KEY = "0x4AAAAAAFWWAuO-ia1i2W8o";
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export interface InquiryFields {
  name: string;
  business: string;
  message: string;
  reply: string;
  website: string;
}

interface TurnstileOptions {
  sitekey: string;
  theme: "dark" | "light" | "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

export interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

/** Loads Turnstile once, and only when a form opens. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing"));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export async function sendInquiry(fields: InquiryFields, turnstileToken: string): Promise<boolean> {
  try {
    const response = await fetch(INQUIRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, turnstileToken, page: window.location.href }),
    });
    const result = await response.json() as { ok?: boolean };
    return response.ok && result.ok === true;
  } catch {
    return false;
  }
}
