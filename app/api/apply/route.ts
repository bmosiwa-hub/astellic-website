import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimitOk, clientIp, isAllowedDocument } from "@/lib/simple-rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  try {
    // Public endpoint that relays large attachments via SMTP — throttle it
    if (!rateLimitOk(`apply:${clientIp(request)}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const position = (formData.get("position") as string)?.trim();
    const cv = formData.get("cv") as File | null;
    const statement = formData.get("statement") as File | null;
    const doc1 = formData.get("doc1") as File | null;
    const doc2 = formData.get("doc2") as File | null;

    // Server-side validation
    if (!name || !email || !position || !cv || !statement || !doc1 || !doc2) {
      return NextResponse.json(
        { error: "All fields and documents are required." },
        { status: 400 }
      );
    }

    const files = [
      { file: cv, label: "CV" },
      { file: statement, label: "Statement of Interest" },
      { file: doc1, label: "Sample of Work / Reference 1" },
      { file: doc2, label: "Sample of Work / Reference 2" },
    ];

    for (const { file, label } of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${label} exceeds the 20 MB file size limit.` },
          { status: 400 }
        );
      }
      if (!isAllowedDocument(file)) {
        return NextResponse.json(
          { error: `${label} must be a PDF or Word document.` },
          { status: 400 }
        );
      }
    }

    // Convert files to buffers
    const [cvBuf, statBuf, doc1Buf, doc2Buf] = await Promise.all([
      cv.arrayBuffer().then(Buffer.from),
      statement.arrayBuffer().then(Buffer.from),
      doc1.arrayBuffer().then(Buffer.from),
      doc2.arrayBuffer().then(Buffer.from),
    ]);

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });

    // Email to Astellic team with attachments
    await transporter.sendMail({
      from: `"Astellic Roster Applications" <${process.env.SMTP_USER}>`,
      replyTo: `"${name}" <${email}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `${name}: ${position}`,
      html: `
        <h2 style="color:#1B2A4A;">New Roster Application</h2>
        <table style="font-family:sans-serif;font-size:15px;line-height:1.6;">
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name</td><td>${name}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Position</td><td>${position}</td></tr>
        </table>
        <p style="margin-top:16px;color:#555;font-size:14px;">
          4 documents are attached: CV, Statement of Interest, and 2 × Sample of Work / Reference from Previous Engagement.
        </p>
      `,
      attachments: [
        { filename: cv.name || "CV.pdf", content: cvBuf },
        { filename: statement.name || "Statement.pdf", content: statBuf },
        { filename: doc1.name || "Document-1.pdf", content: doc1Buf },
        { filename: doc2.name || "Document-2.pdf", content: doc2Buf },
      ],
    });

    // Acknowledgement email to applicant
    await transporter.sendMail({
      from: `"Astellic" <${process.env.SMTP_USER}>`,
      to: `"${name}" <${email}>`,
      subject: `Application Received — Astellic Consultants Roster`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1B2A4A;">
          <div style="background:#1B2A4A;padding:32px 40px;border-radius:8px 8px 0 0;">
            <h1 style="color:#C9A84C;font-size:24px;margin:0;">Astellic</h1>
          </div>
          <div style="padding:40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <p style="font-size:16px;line-height:1.6;margin-top:0;">Dear ${name},</p>
            <p style="font-size:16px;line-height:1.6;">
              Thank you for submitting your application to join the Astellic Consultants Roster
              for the position of <strong>${position}</strong>.
            </p>
            <p style="font-size:16px;line-height:1.6;">
              We confirm that we have received your documents and your application is now
              under review. Our team will carefully assess your qualifications and experience
              against our thematic areas and requirements.
            </p>
            <p style="font-size:16px;line-height:1.6;">
              We will be in touch when opportunities arise that align with your profile.
              In the meantime, please do not hesitate to reach out should you have any
              questions.
            </p>
            <p style="font-size:16px;line-height:1.6;margin-bottom:0;">
              Warm regards,<br/>
              <strong>The Astellic Team</strong><br/>
              <a href="mailto:admin@astellic.com" style="color:#C9A84C;">admin@astellic.com</a><br/>
              <a href="https://www.astellic.com" style="color:#C9A84C;">www.astellic.com</a>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Roster application error:", message);
    return NextResponse.json(
      { error: `Delivery failed: ${message}` },
      { status: 500 }
    );
  }
}
