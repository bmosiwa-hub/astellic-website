import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { rateLimitOk, clientIp } from "@/lib/simple-rate-limit";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    if (!rateLimitOk(`vacancy:${clientIp(request)}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const postingId      = formData.get("postingId") as string;
    const applicantName  = (formData.get("applicantName") as string)?.trim();
    const applicantEmail = (formData.get("applicantEmail") as string)?.trim();
    const applicantPhone = (formData.get("applicantPhone") as string)?.trim() || null;

    if (!postingId || !applicantName || !applicantEmail) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Fetch the posting to get conditions and required docs count
    const posting = await prisma.jobPosting.findUnique({
      where: { id: postingId },
      select: { mandatoryConditions: true, requiredDocuments: true, title: true, status: true, isPublishedToWebsite: true, deadline: true },
    });

    const deadlinePassed = posting?.deadline && posting.deadline < new Date();
    if (!posting || posting.status !== "OPEN" || !posting.isPublishedToWebsite || deadlinePassed) {
      return NextResponse.json({ error: "This vacancy is no longer accepting applications." }, { status: 410 });
    }

    // Parse qualification answers
    const qualificationAnswers: Record<string, boolean> = {};
    let allYes = true;
    for (let i = 0; i < posting.mandatoryConditions.length; i++) {
      const answer = formData.get(`condition_${i}`) as string;
      qualificationAnswers[String(i)] = answer === "yes";
      if (answer !== "yes") allYes = false;
    }
    const isQualified = posting.mandatoryConditions.length === 0 || allYes;

    // Parse uploaded documents
    const attachments: { filename: string; content: Buffer; label: string }[] = [];
    const uploadedDocuments: Record<string, string> = {};

    for (let i = 0; i < posting.requiredDocuments.length; i++) {
      const file = formData.get(`document_${i}`) as File | null;
      const label = formData.get(`document_label_${i}`) as string;
      if (file && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: `${label} exceeds the 10 MB file size limit.` }, { status: 400 });
        }
        const buf = Buffer.from(await file.arrayBuffer());
        attachments.push({ filename: file.name || `${label}.pdf`, content: buf, label });
        uploadedDocuments[label] = file.name || label;
      }
    }

    // Save to DB
    await prisma.jobApplication.create({
      data: {
        jobPostingId:         postingId,
        applicantName,
        applicantEmail,
        applicantPhone,
        qualificationAnswers: qualificationAnswers,
        isQualified,
        uploadedDocuments:    uploadedDocuments,
        fromWebPortal:        true,
        status:               "APPLIED",
      },
    });

    // Send email to HR only if qualified
    if (isQualified && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { ciphers: "SSLv3", rejectUnauthorized: false },
      });

      const conditionRows = posting.mandatoryConditions.map((c) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #f3f4f6">${c}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#16a34a;font-weight:bold">✓ Yes</td></tr>`
      ).join("");

      await transporter.sendMail({
        from: `"Astellic Vacancies" <${process.env.SMTP_USER}>`,
        replyTo: `"${applicantName}" <${applicantEmail}>`,
        to: "hr@astellic.com",
        subject: `New Application — ${posting.title} — ${applicantName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
            <div style="background:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;">
              <p style="color:#fff;font-size:18px;font-weight:bold;margin:0;">Astellic</p>
              <p style="color:#c9a227;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:2px 0 0;">HR — Vacancy Application</p>
            </div>
            <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;color:#374151;font-size:14px;line-height:1.6;">
              <h2 style="color:#0a1628;margin-top:0;">New Qualified Application</h2>
              <p>A new application has been received for <strong>${posting.title}</strong>. This applicant met all mandatory conditions.</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
                <tr><td style="padding:8px 0;color:#6b7280;width:40%">Name</td><td style="font-weight:bold">${applicantName}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280">Email</td><td><a href="mailto:${applicantEmail}" style="color:#c9a227">${applicantEmail}</a></td></tr>
                ${applicantPhone ? `<tr><td style="padding:8px 0;color:#6b7280">Phone</td><td>${applicantPhone}</td></tr>` : ""}
              </table>
              ${conditionRows ? `
              <h3 style="color:#0a1628;font-size:15px;">Mandatory Conditions</h3>
              <table style="width:100%;border-collapse:collapse;font-size:13px;margin:8px 0 16px;">
                <thead><tr style="background:#f9fafb;">
                  <th style="text-align:left;padding:8px;border-bottom:2px solid #e5e7eb;">Condition</th>
                  <th style="text-align:left;padding:8px;border-bottom:2px solid #e5e7eb;">Answer</th>
                </tr></thead>
                <tbody>${conditionRows}</tbody>
              </table>` : ""}
              ${attachments.length > 0 ? `<p style="color:#6b7280;font-size:13px;">${attachments.length} document${attachments.length !== 1 ? "s" : ""} attached: ${attachments.map(a => a.label).join(", ")}.</p>` : ""}
            </div>
          </div>
        `,
        attachments: attachments.map(a => ({ filename: a.filename, content: a.content })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[apply-vacancy]", msg);
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
