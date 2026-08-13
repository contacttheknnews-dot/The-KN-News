// Central email notifications for form submissions (newsletter, contact,
// ad inquiries). All notifications go to NOTIFY_EMAIL. Sending is best-effort:
// the submission is already stored in the database before we get here, so a
// mail failure must never fail the user's request — it is logged instead.

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export const NOTIFY_EMAIL =
  process.env.NOTIFY_EMAIL || "contacttheknnews@gmail.com";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export type NotificationField = { label: string; value: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send a form-submission notification to NOTIFY_EMAIL.
 * Never throws; returns true if the mail was handed to the SMTP server.
 */
export async function sendNotification(
  subject: string,
  fields: NotificationField[],
  replyTo?: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn(
      `[mailer] SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — ` +
        `notification "${subject}" not emailed. Submission is saved in the admin panel.`
    );
    return false;
  }

  const rows = fields
    .filter((f) => f.value)
    .map(
      (f) =>
        `<tr><td style="padding:6px 12px;font-weight:bold;color:#555;vertical-align:top;white-space:nowrap">${escapeHtml(
          f.label
        )}</td><td style="padding:6px 12px;color:#222">${escapeHtml(f.value).replace(
          /\n/g,
          "<br/>"
        )}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <div style="background:#d21f2a;color:#fff;padding:12px 16px;border-radius:6px 6px 0 0">
        <strong>The KN News</strong> — ${escapeHtml(subject)}
      </div>
      <table style="border-collapse:collapse;width:100%;border:1px solid #eee;border-top:none">${rows}</table>
      <p style="color:#888;font-size:12px">theknnews.com से स्वचालित सूचना • ${new Date().toLocaleString(
        "en-IN",
        { timeZone: "Asia/Kolkata" }
      )} IST</p>
    </div>`;

  const text = fields
    .filter((f) => f.value)
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n");

  try {
    await t.sendMail({
      from: `"The KN News Website" <${process.env.SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject: `[The KN News] ${subject}`,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    return true;
  } catch (err) {
    console.error(`[mailer] failed to send "${subject}":`, err);
    return false;
  }
}
