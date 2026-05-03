import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { ciphers: "SSLv3" },
});

interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[mail] SMTP_USER or SMTP_PASS not set — skipping email");
    return;
  }
  await transporter.sendMail({
    from: `"Astellic Finance" <${process.env.SMTP_USER}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
  });
}

/* ── Branded email wrapper ─────────────────────────────────────────── */

function layout(body: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: #0a1628; padding: 24px 32px; }
    .header-title { color: #fff; font-size: 18px; font-weight: bold; margin: 0; }
    .header-sub { color: #c9a227; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 2px 0 0; }
    .content { padding: 32px; color: #374151; font-size: 14px; line-height: 1.6; }
    .content h2 { color: #0a1628; margin-top: 0; }
    .note-box { background: #fef9ee; border-left: 4px solid #c9a227; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-style: italic; color: #4b5563; }
    .btn { display: inline-block; background: #c9a227; color: #fff !important; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 16px 32px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="header-title">Astellic</p>
      <p class="header-sub">Finance</p>
    </div>
    <div class="content">${body}</div>
    <div class="footer">This is an automated notification from the Astellic Finance system. Do not reply to this email.</div>
  </div>
</body>
</html>`;
}

/* ── Specific email templates ──────────────────────────────────────── */

const ACTION_LABEL: Record<string, string> = {
  CHANGES_REQUESTED: "requested changes on",
  REJECTED: "rejected",
};

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://astellic.com";

/**
 * Notify the submitter that FM has actioned their submission.
 */
export async function notifySubmitterOfFMAction({
  to,
  submitterName,
  action,
  note,
  submissionId,
  submissionLabel,
}: {
  to: string;
  submitterName: string;
  action: "CHANGES_REQUESTED" | "REJECTED";
  note: string | null;
  submissionId: string;
  submissionLabel: string;
}): Promise<void> {
  const verb = ACTION_LABEL[action] ?? action.toLowerCase().replace("_", " ");
  const subject =
    action === "REJECTED"
      ? `Your submission has been rejected — ${submissionLabel}`
      : `Changes requested on your submission — ${submissionLabel}`;

  const body = `
    <h2>Hi ${submitterName},</h2>
    <p>The <strong>Finance Manager</strong> has <strong>${verb}</strong> your submission:</p>
    <p><strong>${submissionLabel}</strong></p>
    ${note ? `<div class="note-box"><strong>Note:</strong> ${note}</div>` : ""}
    ${
      action === "CHANGES_REQUESTED"
        ? `<p>Please review the feedback, update your submission, and resubmit at your earliest convenience.</p>
           <a class="btn" href="${BASE_URL}/astelfin_26/my/submissions/${submissionId}">View &amp; Resubmit</a>`
        : `<p>If you have questions, please contact the Finance Manager directly.</p>
           <a class="btn" href="${BASE_URL}/astelfin_26/my/submissions/${submissionId}">View Submission</a>`
    }
  `;

  await sendMail({ to, subject, html: layout(body) });
}

/**
 * Notify FM(s) that the CEO has actioned a submission they approved.
 */
export async function notifyFMOfCEOAction({
  to,
  submitterName,
  action,
  note,
  submissionId,
  submissionLabel,
}: {
  to: string | string[];
  submitterName: string;
  action: "CHANGES_REQUESTED" | "REJECTED";
  note: string | null;
  submissionId: string;
  submissionLabel: string;
}): Promise<void> {
  const verb = ACTION_LABEL[action] ?? action.toLowerCase().replace("_", " ");
  const subject =
    action === "REJECTED"
      ? `CEO rejected a submission — ${submissionLabel}`
      : `CEO requested changes — ${submissionLabel}`;

  const body = `
    <h2>Action Required</h2>
    <p>The <strong>Executive Director</strong> has <strong>${verb}</strong> a submission from <strong>${submitterName}</strong>:</p>
    <p><strong>${submissionLabel}</strong></p>
    ${note ? `<div class="note-box"><strong>Note:</strong> ${note}</div>` : ""}
    <p>Please review the CEO's feedback and follow up with the submitter as appropriate.</p>
    <a class="btn" href="${BASE_URL}/astelfin_26/invoices/${submissionId}">View Submission</a>
  `;

  await sendMail({ to, subject, html: layout(body) });
}

/**
 * Remind FM(s) that a recurring payable is due in 7 days.
 */
export async function notifyFMOfUpcomingPayable({
  to,
  payableName,
  amount,
  currency,
  dueDate,
  vendor,
}: {
  to: string | string[];
  payableName: string;
  amount: number;
  currency: string;
  dueDate: Date;
  vendor?: string | null;
}): Promise<void> {
  const dueDateStr = dueDate.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const amountStr = new Intl.NumberFormat("en-MW", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(amount).replace("MWK", "MWK ");

  const subject = `Upcoming payment due in 7 days — ${payableName}`;

  const body = `
    <h2>Upcoming Payment Reminder</h2>
    <p>The following recurring payment is due in <strong>7 days</strong>. Please initiate the payment request.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#6b7280;width:40%">Payment</td><td style="padding:8px 0;font-weight:bold">${payableName}</td></tr>
      ${vendor ? `<tr><td style="padding:8px 0;color:#6b7280">Vendor</td><td style="padding:8px 0">${vendor}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#6b7280">Amount</td><td style="padding:8px 0;font-weight:bold;color:#0a1628">${amountStr}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Due Date</td><td style="padding:8px 0">${dueDateStr}</td></tr>
    </table>
    <a class="btn" href="${BASE_URL}/astelfin_26/payables">View Accounts Payable</a>
  `;

  await sendMail({ to, subject, html: layout(body) });
}
