// Renders the submissions page as plain HTML: no scripts, so the visitor's words can only ever be text.

export const STATUSES = ["new", "replied", "archived"] as const;
export type Status = typeof STATUSES[number];

export interface Submission {
  id: number;
  created_at: string;
  name: string;
  business: string;
  reply: string;
  message: string;
  page: string;
  status: Status;
  email_status: "pending" | "sent" | "failed";
}

const EMAIL_PATTERN = /^[^\s@;,<>"()]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const LABELS: Record<Status, string> = { new: "New", replied: "Replied", archived: "Archived" };
const MOVES: Record<Status, Status[]> = { new: ["replied", "archived"], replied: ["new", "archived"], archived: ["new"] };

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function when(createdAt: string, timeZone: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return escapeHtml(createdAt);
  return escapeHtml(date.toLocaleString("en-US", { timeZone, dateStyle: "medium", timeStyle: "short" }));
}

function card(item: Submission, timeZone: string) {
  const reply = EMAIL_PATTERN.test(item.reply)
    ? `<a href="mailto:${escapeHtml(item.reply)}">${escapeHtml(item.reply)}</a>`
    : escapeHtml(item.reply);
  const moves = MOVES[item.status].map((status) => `
        <form method="post" action="status">
          <input type="hidden" name="id" value="${item.id}">
          <input type="hidden" name="status" value="${status}">
          <input type="hidden" name="back" value="${item.status}">
          <button>Mark ${LABELS[status].toLowerCase()}</button>
        </form>`).join("");
  return `
    <article>
      <header>
        <h2>${escapeHtml(item.name)}${item.business ? ` <span>${escapeHtml(item.business)}</span>` : ""}</h2>
        <time datetime="${escapeHtml(item.created_at)}">#${item.id} · ${when(item.created_at, timeZone)}</time>
      </header>
      <p class="reply">Reply to: ${reply}</p>
      <p class="message">${escapeHtml(item.message)}</p>
      ${item.email_status === "failed" ? `<p class="warn">The email copy didn't send. This page is the only copy.</p>` : ""}
      <footer>${moves}</footer>
    </article>`;
}

export function renderPage(items: Submission[], counts: Record<Status, number>, current: Status, timeZone: string) {
  const tabs = STATUSES.map((status) => `<a href="?status=${status}"${status === current ? ` aria-current="page"` : ""}>${LABELS[status]} <b>${counts[status]}</b></a>`).join("");
  const list = items.length ? items.map((item) => card(item, timeZone)).join("") : `<p class="empty">Nothing ${LABELS[current].toLowerCase()} yet.</p>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Website inquiries</title>
<style>
  :root { color-scheme: dark; --bg: rgb(16 13 11); --panel: rgb(23 19 15); --text: rgb(243 235 221); --muted: rgb(168 152 130); --accent: rgb(255 196 120); --border: rgb(92 78 64); --warn: rgb(255 140 110); }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { margin: 0 0 4px; color: var(--accent); font-size: 22px; letter-spacing: .04em; text-transform: uppercase; }
  .sub { margin: 0 0 24px; color: var(--muted); }
  nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  nav a { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; color: var(--muted); text-decoration: none; }
  nav a[aria-current] { color: var(--bg); background: var(--accent); border-color: var(--accent); }
  article { background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 14px; }
  article header { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: baseline; }
  h2 { margin: 0; font-size: 17px; }
  h2 span, time, .reply { color: var(--muted); font-weight: normal; font-size: 14px; }
  .reply { margin: 6px 0 0; }
  .message { white-space: pre-wrap; overflow-wrap: anywhere; margin: 12px 0; }
  .warn { color: var(--warn); margin: 0 0 12px; }
  a { color: var(--accent); }
  footer { display: flex; gap: 8px; flex-wrap: wrap; }
  form { margin: 0; }
  button { font: inherit; font-size: 13px; color: var(--text); background: transparent; border: 1px solid var(--border); border-radius: 6px; padding: 5px 10px; cursor: pointer; }
  button:hover { border-color: var(--accent); color: var(--accent); }
  .empty { color: var(--muted); }
</style>
</head>
<body>
<main>
  <h1>Website inquiries</h1>
  <p class="sub">Everything sent through the Websites form, newest first.</p>
  <nav>${tabs}</nav>
  ${list}
</main>
</body>
</html>`;
}
