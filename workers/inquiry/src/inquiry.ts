// Turns a Websites form submission into an email. Pure functions, so the Worker stays a thin shell.

export interface Inquiry {
  name: string;
  business: string;
  reply: string;
  message: string;
  page: string;
}

export interface InquiryEmail {
  subject: string;
  text: string;
  replyTo?: string;
}

const LIMITS = { name: 100, business: 120, reply: 200, message: 5000, page: 300 } as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(body: Record<string, unknown>, key: keyof typeof LIMITS, singleLine: boolean) {
  const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
  // One-line fields end up in the subject, so line breaks are flattened.
  return singleLine ? value.replace(/\s+/g, " ") : value;
}

/** Returns the cleaned inquiry, or the name of the first field that is missing or too long. */
export function parseInquiry(body: unknown): { inquiry: Inquiry } | { error: string } {
  if (!body || typeof body !== "object") return { error: "body" };
  const record = body as Record<string, unknown>;
  const inquiry: Inquiry = {
    name: field(record, "name", true),
    business: field(record, "business", true),
    reply: field(record, "reply", true),
    message: field(record, "message", false),
    page: field(record, "page", true),
  };
  for (const key of ["name", "reply", "message"] as const) {
    if (!inquiry[key]) return { error: key };
  }
  for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    if (inquiry[key].length > LIMITS[key]) return { error: key };
  }
  return { inquiry };
}

export function buildInquiryEmail(inquiry: Inquiry): InquiryEmail {
  const from = inquiry.business ? `${inquiry.name} (${inquiry.business})` : inquiry.name;
  const text = [
    `Name: ${inquiry.name}`,
    `Business: ${inquiry.business || "-"}`,
    `Reply to: ${inquiry.reply}`,
    "",
    inquiry.message,
    "",
    `Sent from ${inquiry.page || "the Websites form"}`,
  ].join("\n");
  return {
    subject: `Website inquiry from ${from}`,
    text,
    // A phone number can't be replied to by email; the address stays in the body either way.
    replyTo: EMAIL_PATTERN.test(inquiry.reply) ? inquiry.reply : undefined,
  };
}
