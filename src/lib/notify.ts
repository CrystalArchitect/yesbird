import "server-only";
import { formatDayLong } from "@/lib/dates";
import { CONTACT_METHODS, MASCOT_META, TIME_BY_ID, VIBES } from "@/lib/options";
import type { Invite, InviteResponse } from "@/lib/schemas";

/**
 * Tells the asker that their person said yes.
 *
 * Delivery is picked from the environment, first match wins:
 *   1. RESEND_API_KEY        → email via Resend (https://resend.com), from EMAIL_FROM
 *   2. NOTIFY_WEBHOOK_URL    → POST the JSON payload below (Zapier, Make, n8n, your own endpoint…)
 *   3. nothing configured    → logged to the server console so local dev still shows the message
 *
 * Never throws: a failed notification must not break the recipient's "It's a date" moment.
 * See docs/HANDOFF.md for wiring instructions.
 */
export async function notifyAskerOfYes(invite: Invite, baseUrl: string): Promise<void> {
  const response = invite.response;
  if (!response) return;

  const payload = buildPayload(invite, response, baseUrl);

  try {
    if (process.env.RESEND_API_KEY && invite.senderEmail) {
      await sendWithResend(invite.senderEmail, payload);
      return;
    }
    if (process.env.NOTIFY_WEBHOOK_URL) {
      await sendToWebhook(process.env.NOTIFY_WEBHOOK_URL, payload);
      return;
    }
    console.info(`[yesbird] ${invite.recipientName} said yes to ${invite.senderName}\n${payload.text}`);
  } catch (err) {
    console.error("[yesbird] notification failed", err);
  }
}

export type NotificationPayload = {
  event: "invite.answered";
  inviteId: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  nestUrl: string | null;
  subject: string;
  text: string;
  html: string;
  response: InviteResponse;
};

function buildPayload(invite: Invite, r: InviteResponse, baseUrl: string): NotificationPayload {
  const nestUrl = invite.manageKey ? `${baseUrl.replace(/\/$/, "")}/nest/${invite.manageKey}` : null;
  const contact = CONTACT_METHODS.find((c) => c.id === r.contactMethod)?.label ?? r.contactMethod;
  const vibe = VIBES.find((v) => v.id === invite.vibe);
  const times = r.chosenSlots.length
    ? r.chosenSlots.map(
        (s) =>
          `${formatDayLong(s.date)} — ${s.times.map((t) => `${TIME_BY_ID[t].label} (${TIME_BY_ID[t].hint})`).join(", ")}`,
      )
    : ["The days you offered had already passed when they opened it. They still said yes — pick a new one together."];
  const attempts =
    r.noAttempts === 0
      ? "Didn't even touch the No button."
      : `Tried No ${r.noAttempts} time${r.noAttempts === 1 ? "" : "s"} first. Cute.`;

  const subject = `${invite.recipientName} said yes! 💗`;

  const text = [
    `${invite.recipientName} said yes to your date, ${invite.senderName}!`,
    attempts,
    "",
    "TIMES THAT WORK",
    ...times.map((t) => `  • ${t}`),
    "",
    "REACH THEM",
    `  Phone: ${r.phone}`,
    r.email ? `  Email: ${r.email}` : null,
    `  Prefers: ${contact}${r.contactHandle ? ` · ${r.contactHandle}` : ""}`,
    "",
    "CRAVING",
    `  ${r.foods.length ? r.foods.join(", ") : "No strong opinions."}`,
    r.placeIdeas ? `  Place ideas: ${r.placeIdeas}` : null,
    "",
    "INTO",
    `  ${r.interests.length ? r.interests.join(", ") : "Kept that a mystery."}`,
    "",
    "LITTLE NOTES",
    `  ${r.notes || "Nothing extra."}`,
    "",
    vibe ? `Date vibe you suggested: ${vibe.label}` : null,
    nestUrl ? `Your private page: ${nestUrl}` : null,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  const html = renderHtml({
    invite,
    r,
    attempts,
    times,
    contact,
    nestUrl,
    vibeLabel: vibe ? `${vibe.emoji} ${vibe.label}` : null,
  });

  return {
    event: "invite.answered",
    inviteId: invite.id,
    senderName: invite.senderName,
    senderEmail: invite.senderEmail ?? "",
    recipientName: invite.recipientName,
    nestUrl,
    subject,
    text,
    html,
    response: r,
  };
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function chips(items: string[], empty: string) {
  if (items.length === 0) return `<span style="color:#8a6b75">${esc(empty)}</span>`;
  return items
    .map(
      (i) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:#ffe1e9;font-size:13px;font-weight:600;color:#4a2a36">${esc(i)}</span>`,
    )
    .join("");
}

function block(title: string, emoji: string, body: string) {
  return `
    <tr><td style="padding:0 0 12px">
      <div style="border-radius:20px;background:#ffffff;border:1px solid #ffd6e0;padding:16px 18px">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#a3778a;margin-bottom:8px">${emoji} ${esc(title)}</div>
        <div style="font-size:15px;line-height:1.5;color:#3d2230">${body}</div>
      </div>
    </td></tr>`;
}

function renderHtml({
  invite,
  r,
  attempts,
  times,
  contact,
  nestUrl,
  vibeLabel,
}: {
  invite: Invite;
  r: InviteResponse;
  attempts: string;
  times: string[];
  contact: string;
  nestUrl: string | null;
  vibeLabel: string | null;
}) {
  const mascot = MASCOT_META[invite.mascot];
  return `<!doctype html>
<html><body style="margin:0;background:#fff4f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff4f7;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px">
  <tr><td align="center" style="padding:0 0 20px">
    <div style="font-size:54px;line-height:1">${mascot.emoji}</div>
    <h1 style="margin:12px 0 6px;font-size:30px;line-height:1.15;color:#e94d78">${esc(invite.recipientName)} said yes!</h1>
    <p style="margin:0;font-size:16px;color:#6b4a58">${esc(attempts)} ${mascot.label.split(" ")[0]} did great.</p>
  </td></tr>
  ${block(
    "Times that work",
    "🗓️",
    `<ul style="margin:0;padding-left:18px">${times.map((t) => `<li style="margin:0 0 4px">${esc(t)}</li>`).join("")}</ul>`,
  )}
  ${block(
    "Reach them",
    "📱",
    `<div style="font-size:20px;font-weight:700;color:#e94d78"><a href="tel:${esc(r.phone)}" style="color:#e94d78;text-decoration:none">${esc(r.phone)}</a></div>` +
      (r.email
        ? `<div><a href="mailto:${esc(r.email)}" style="color:#3d2230">${esc(r.email)}</a></div>`
        : "") +
      `<div style="color:#8a6b75;font-size:14px;margin-top:4px">Prefers: ${esc(contact)}${
        r.contactHandle ? ` · ${esc(r.contactHandle)}` : ""
      }</div>`,
  )}
  ${block(
    "Craving",
    "🍜",
    chips(r.foods, "No strong opinions. Dangerous.") +
      (r.placeIdeas ? `<p style="margin:8px 0 0">${esc(r.placeIdeas)}</p>` : ""),
  )}
  ${block("Into", "🎬", chips(r.interests, "Kept that a mystery."))}
  ${block("Little notes", "📝", r.notes ? esc(r.notes) : `<span style="color:#8a6b75">Nothing extra. Ask in person.</span>`)}
  ${vibeLabel ? block("Vibe you suggested", "✨", esc(vibeLabel)) : ""}
  ${
    nestUrl
      ? `<tr><td align="center" style="padding:8px 0 24px">
      <a href="${esc(nestUrl)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#e94d78;color:#fff;font-weight:700;text-decoration:none;font-size:16px">Open your private page</a>
    </td></tr>`
      : ""
  }
  <tr><td align="center" style="font-size:12px;color:#a3778a;padding-top:8px">
    Sent by Yesbird because someone brave asked someone lovely.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

async function sendWithResend(to: string, p: NotificationPayload) {
  const from = process.env.EMAIL_FROM ?? "Yesbird <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject: p.subject, html: p.html, text: p.text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

async function sendToWebhook(url: string, p: NotificationPayload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}
