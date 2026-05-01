import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const position = (formData.get("position") as string)?.trim();
    const cv = formData.get("cv") as File | null;
    const statement = formData.get("statement") as File | null;
    const sample = formData.get("sample") as File | null;
    const reference = formData.get("reference") as File | null;

    // Server-side validation
    if (!name || !email || !position || !cv || !statement || !sample || !reference) {
      return NextResponse.json(
        { error: "All fields and documents are required." },
        { status: 400 }
      );
    }

    const files = [
      { file: cv, label: "CV" },
      { file: statement, label: "Statement of Interest" },
      { file: sample, label: "Sample of Work" },
      { file: reference, label: "Reference Letter" },
    ];

    for (const { file, label } of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${label} exceeds the 20 MB file size limit.` },
          { status: 400 }
        );
      }
    }

    // Convert files to buffers
    const [cvBuf, statBuf, sampleBuf, refBuf] = await Promise.all([
      cv.arrayBuffer().then(Buffer.from),
      statement.arrayBuffer().then(Buffer.from),
      sample.arrayBuffer().then(Buffer.from),
      reference.arrayBuffer().then(Buffer.from),
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
          4 documents are attached: CV, Statement of Interest, Sample of Work, Reference Letter from Previous Engagement.
        </p>
      `,
      attachments: [
        { filename: cv.name || "CV.pdf", content: cvBuf },
        { filename: statement.name || "Statement.pdf", content: statBuf },
        { filename: sample.name || "Sample-of-Work.pdf", content: sampleBuf },
        { filename: reference.name || "Reference-Letter.pdf", content: refBuf },
      ],
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
