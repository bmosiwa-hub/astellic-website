import nodemailer from "nodemailer";

// STARTTLS on 587 with a modern TLS floor. The previous `ciphers: "SSLv3"`
// setting was deprecated/insecure and could break the handshake with Office 365.
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,        // STARTTLS (upgraded after connect)
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { minVersion: "TLSv1.2" },
});

interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

const MAIL_FROM = process.env.MAIL_FROM ?? `"Astellic Finance" <${process.env.SMTP_USER ?? "finance@astellic.com"}>`;

/**
 * Send an email. Never throws — a delivery failure must not break the underlying
 * business action — but failures are logged loudly (they used to be swallowed
 * silently, which hid the whole notification pipeline going down).
 *
 * Uses Resend's HTTP API when RESEND_API_KEY is set (recommended — no dependency
 * on Office 365 basic auth, which Microsoft is phasing out); otherwise falls back
 * to SMTP. Returns true on success.
 */
export async function sendMail({ to, subject, html }: MailOptions): Promise<boolean> {
  const recipients = Array.isArray(to) ? to : [to];

  // ── Preferred path: Resend HTTP API (no SMTP basic-auth dependency) ──────────
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: MAIL_FROM, to: recipients, subject, html }),
      });
      if (!res.ok) {
        console.error(`[mail] Resend send failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[mail] Resend send threw:", err);
      return false;
    }
  }

  // ── Fallback: Office 365 SMTP ────────────────────────────────────────────────
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("[mail] No email transport configured (set RESEND_API_KEY, or SMTP_USER/SMTP_PASS) — email NOT sent:", subject);
    return false;
  }
  try {
    await transporter.sendMail({ from: MAIL_FROM, to: recipients.join(", "), subject, html });
    return true;
  } catch (err) {
    console.error("[mail] SMTP send failed:", err, "| subject:", subject);
    return false;
  }
}

/* ── HTML escaping ─────────────────────────────────────────────────── */
// User-supplied values (names, labels, notes) are interpolated into email
// HTML — escape them so a crafted value can't inject markup into inboxes.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
 * Notify all Finance Managers that a new submission has been created
 * and is waiting for their review.
 */
export async function notifyFMOfNewSubmission({
  to,
  submitterName,
  submissionId,
  submissionLabel,
  amount,
  currency,
}: {
  to: string | string[];
  submitterName: string;
  submissionId: string;
  submissionLabel: string;
  amount: number;
  currency: string;
}): Promise<void> {
  submitterName   = escapeHtml(submitterName);
  submissionLabel = escapeHtml(submissionLabel);
  const formatted = new Intl.NumberFormat("en-MW", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(amount).replace(currency, currency + " ");

  const body = `
    <h2>New Submission Awaiting Review</h2>
    <p><strong>${submitterName}</strong> has submitted a new request that requires your review:</p>
    <p><strong>${submissionLabel}</strong></p>
    <p><strong>Amount:</strong> ${formatted}</p>
    <p>Please review this submission and either approve it for CEO sign-off or request changes.</p>
    <a class="btn" href="${BASE_URL}/astelfin_26/invoices/${submissionId}">Review Submission</a>
  `;

  await sendMail({
    to,
    subject: `New Submission Awaiting Review — ${submissionLabel}`,
    html: layout(body),
  });
}

/**
 * Notify CEO(s) that FM has approved a submission and it needs their sign-off.
 */
export async function notifyCEOOfFMApproval({
  to,
  submitterName,
  submissionId,
  submissionLabel,
  amount,
  currency,
  fmNote,
}: {
  to: string | string[];
  submitterName: string;
  submissionId: string;
  submissionLabel: string;
  amount: number;
  currency: string;
  fmNote: string | null;
}): Promise<void> {
  submitterName   = escapeHtml(submitterName);
  submissionLabel = escapeHtml(submissionLabel);
  fmNote          = fmNote ? escapeHtml(fmNote) : fmNote;
  const formatted = new Intl.NumberFormat("en-MW", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(amount).replace(currency, currency + " ");

  const body = `
    <h2>Submission Awaiting Your Approval</h2>
    <p>The <strong>Finance Manager</strong> has reviewed and approved the following submission from <strong>${submitterName}</strong>. It now requires your sign-off:</p>
    <p><strong>${submissionLabel}</strong></p>
    <p><strong>Amount:</strong> ${formatted}</p>
    ${fmNote ? `<div class="note-box"><strong>FM Note:</strong> ${fmNote}</div>` : ""}
    <p>Please review and approve or request changes.</p>
    <a class="btn" href="${BASE_URL}/astelfin_26/invoices/${submissionId}">Review &amp; Approve</a>
  `;

  await sendMail({
    to,
    subject: `Action Required: Submission Pending Your Approval — ${submissionLabel}`,
    html: layout(body),
  });
}

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
  submitterName   = escapeHtml(submitterName);
  submissionLabel = escapeHtml(submissionLabel);
  note            = note ? escapeHtml(note) : note;
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
  submitterName   = escapeHtml(submitterName);
  submissionLabel = escapeHtml(submissionLabel);
  note            = note ? escapeHtml(note) : note;
  const verb = ACTION_LABEL[action] ?? action.toLowerCase().replace("_", " ");
  const subject =
    action === "REJECTED"
      ? `CEO rejected a submission — ${submissionLabel}`
      : `CEO requested changes — ${submissionLabel}`;

  const body = `
    <h2>Action Required</h2>
    <p>The <strong>Chief Executive Officer</strong> has <strong>${verb}</strong> a submission from <strong>${submitterName}</strong>:</p>
    <p><strong>${submissionLabel}</strong></p>
    ${note ? `<div class="note-box"><strong>Note:</strong> ${note}</div>` : ""}
    <p>Please review the CEO's feedback and follow up with the submitter as appropriate.</p>
    <a class="btn" href="${BASE_URL}/astelfin_26/invoices/${submissionId}">View Submission</a>
  `;

  await sendMail({ to, subject, html: layout(body) });
}

/**
 * Send a tax summary report (monthly or annual) to CEO and FM.
 */
export async function sendTaxReport({
  to,
  period,
  periodType,
  paye,
  wht,
  corporateTaxEstimate,
  netBalance,
}: {
  to: string | string[];
  period: string;
  periodType: "monthly" | "annual";
  paye: number;
  wht: number;
  corporateTaxEstimate: number;
  netBalance: number;
}): Promise<void> {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-MW", { style: "currency", currency: "MWK", minimumFractionDigits: 2 })
      .format(n).replace("MWK", "MWK ");

  const totalTax = paye + wht + corporateTaxEstimate;
  const subject = `${periodType === "monthly" ? "Monthly" : "Annual"} Tax Report — ${period}`;

  const body = `
    <h2>${periodType === "monthly" ? "Monthly" : "Annual"} Tax Summary</h2>
    <p>Period: <strong>${period}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
      <thead><tr style="background:#f3f4f6">
        <th style="text-align:left;padding:10px;border-bottom:2px solid #e5e7eb">Tax Type</th>
        <th style="text-align:right;padding:10px;border-bottom:2px solid #e5e7eb">Amount (MWK)</th>
      </tr></thead>
      <tbody>
        <tr><td style="padding:10px;border-bottom:1px solid #f3f4f6">PAYE (Pay As You Earn)</td><td style="text-align:right;padding:10px;border-bottom:1px solid #f3f4f6;font-weight:bold">${fmt(paye)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #f3f4f6">Withholding Tax (WHT)</td><td style="text-align:right;padding:10px;border-bottom:1px solid #f3f4f6;font-weight:bold">${fmt(wht)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #f3f4f6">Corporate Income Tax (estimated at 30% of net)</td><td style="text-align:right;padding:10px;border-bottom:1px solid #f3f4f6;font-weight:bold">${fmt(corporateTaxEstimate)}</td></tr>
        <tr style="background:#0a1628;color:#fff"><td style="padding:10px;font-weight:bold">Total Tax Obligations</td><td style="text-align:right;padding:10px;font-weight:bold">${fmt(totalTax)}</td></tr>
      </tbody>
    </table>
    <p style="font-size:12px;color:#6b7280">Net balance before CIT: <strong>${fmt(netBalance)}</strong>. Corporate income tax is an estimate based on a 30% flat rate and may vary based on allowable deductions.</p>
    <a class="btn" href="${BASE_URL}/astelfin_26/reports/tax">View Tax Dashboard</a>
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
  payableName = escapeHtml(payableName);
  vendor      = vendor ? escapeHtml(vendor) : vendor;
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

/**
 * Notify CEO + FM that a financial period has been closed, locked, or reopened.
 */
export async function notifyPeriodAction({
  to,
  periodKey,
  action,
  actorName,
  actorRole,
  checksum,
}: {
  to: string | string[];
  periodKey: string;
  action: "CLOSED" | "LOCKED" | "REOPENED";
  actorName: string;
  actorRole: string;
  checksum?: string;
}): Promise<void> {
  actorName = escapeHtml(actorName);
  const [year, month] = periodKey.split("-");
  const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const actionLabels: Record<string, string> = {
    CLOSED:   "closed",
    LOCKED:   "locked for donor submission",
    REOPENED: "reopened",
  };
  const verb  = actionLabels[action] ?? action.toLowerCase();
  const isBad = action === "REOPENED";
  const subject =
    action === "REOPENED" ? `Period reopened — ${monthName}` :
    action === "LOCKED"   ? `Period locked — ${monthName}` :
                            `Period closed — ${monthName}`;

  const body = `
    <h2>Financial Period ${action === "LOCKED" ? "Locked" : action === "CLOSED" ? "Closed" : "Reopened"}</h2>
    <p>The <strong>${monthName}</strong> period has been <strong>${verb}</strong> by ${actorName} (${actorRole.replace("_", " ")}).</p>
    ${checksum ? `<div class="note-box"><strong>Integrity checksum:</strong><br /><code style="font-size:11px;word-break:break-all">${checksum}</code><br /><span style="font-size:11px;color:#6b7280">Store this for audit purposes. It will be recomputed on export to verify data integrity.</span></div>` : ""}
    ${isBad ? `<div class="note-box" style="border-color:#ef4444;background:#fef2f2"><strong>⚠ Caution:</strong> Reopening a locked period invalidates its checksum. All changes must be re-reviewed before relocking.</div>` : ""}
    <a class="btn" href="${BASE_URL}/astelfin_26/periods">View Periods</a>
  `;

  await sendMail({ to, subject, html: layout(body) });
}

/**
 * Notify CEO that a procurement request has been submitted for approval.
 */
export async function notifyProcurementSubmitted({
  to,
  title,
  estimatedCost,
  currency,
  submittedBy,
  procurementId,
  quotationCount,
}: {
  to: string | string[];
  title: string;
  estimatedCost: number;
  currency: string;
  submittedBy: string;
  procurementId: string;
  quotationCount: number;
}): Promise<void> {
  title       = escapeHtml(title);
  submittedBy = escapeHtml(submittedBy);
  const amountStr = new Intl.NumberFormat("en-MW", {
    style: "currency", currency, minimumFractionDigits: 0,
  }).format(estimatedCost).replace("MWK", "MWK ");

  const subject = `Procurement approval required — ${title}`;

  const body = `
    <h2>Procurement Approval Required</h2>
    <p>The Finance Manager has submitted a procurement request for your approval.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#6b7280;width:40%">Item</td><td style="padding:8px 0;font-weight:bold">${title}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Estimated Cost</td><td style="padding:8px 0;font-weight:bold;color:#0a1628">${amountStr}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Quotations</td><td style="padding:8px 0">${quotationCount} attached</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Submitted by</td><td style="padding:8px 0">${submittedBy}</td></tr>
    </table>
    <a class="btn" href="${BASE_URL}/astelfin_26/procurement/${procurementId}">Review &amp; Approve</a>
  `;

  await sendMail({ to, subject, html: layout(body) });
}

/**
 * Daily compliance digest — overdue liquidations + grant over-utilisation.
 * Only sent when there is at least one issue.
 */
export async function sendComplianceDigest({
  to,
  overdueItems,
  grantAlerts,
}: {
  to: string | string[];
  overdueItems: { label: string; daysOverdue: number; amount: number; currency: string }[];
  grantAlerts: { name: string; donorName: string; pct: number; currency: string; totalAmount: number }[];
}): Promise<void> {
  const totalIssues = overdueItems.length + grantAlerts.length;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const subject = `[Compliance] ${totalIssues} issue${totalIssues !== 1 ? "s" : ""} flagged — ${dateStr}`;

  const fmt = (n: number, cur: string) =>
    new Intl.NumberFormat("en-MW", { style: "currency", currency: cur, minimumFractionDigits: 0 })
      .format(n).replace("MWK", "MWK ");

  const overdueRows = overdueItems.map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(item.label)}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right">${fmt(item.amount, item.currency)}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#dc2626;font-weight:bold;text-align:right">${item.daysOverdue}d overdue</td>
    </tr>`).join("");

  const grantRows = grantAlerts.map((g) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(g.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">${escapeHtml(g.donorName)}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:${g.pct >= 100 ? "#dc2626" : "#d97706"};text-align:right">${g.pct.toFixed(1)}% of ${fmt(g.totalAmount, g.currency)}</td>
    </tr>`).join("");

  const body = `
    <h2>Daily Compliance Digest</h2>
    <p>${dateStr} — <strong>${totalIssues} item${totalIssues !== 1 ? "s" : ""} require${totalIssues === 1 ? "s" : ""} attention.</strong></p>

    ${overdueItems.length > 0 ? `
    <h3 style="color:#dc2626;font-size:15px;margin-top:24px">Overdue Liquidations (${overdueItems.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#fef2f2">
        <th style="text-align:left;padding:8px;border-bottom:2px solid #fecaca">Request</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #fecaca">Amount</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #fecaca">Status</th>
      </tr></thead>
      <tbody>${overdueRows}</tbody>
    </table>` : ""}

    ${grantAlerts.length > 0 ? `
    <h3 style="color:#d97706;font-size:15px;margin-top:24px">Grant Over-Utilisation (${grantAlerts.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#fffbeb">
        <th style="text-align:left;padding:8px;border-bottom:2px solid #fde68a">Grant</th>
        <th style="text-align:left;padding:8px;border-bottom:2px solid #fde68a">Donor</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #fde68a">Utilisation</th>
      </tr></thead>
      <tbody>${grantRows}</tbody>
    </table>` : ""}

    <a class="btn" href="${BASE_URL}/astelfin_26/compliance">View Compliance Dashboard</a>
  `;

  await sendMail({ to, subject, html: layout(body) });
}
