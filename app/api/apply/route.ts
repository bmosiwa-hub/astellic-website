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
    const sample1 = formData.get("sample1") as File | null;
    const sample2 = formData.get("sample2") as File | null;

    // Server-side validation
    if (!name || !email || !position || !cv || !statement || !sample1 || !sample2) {
      return NextResponse.json(
        { error: "All fields and documents are required." },
        { status: 400 }
      );
    }

    const files = [
      { file: cv, label: "CV" },
      { file: statement, label: "Statement of Interest" },
      { file: sample1, label: "Sample Work 1" },
      { file: sample2, label: "Sample Work 2" },
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
    const [cvBuf, statBuf, s1Buf, s2Buf] = await Promise.all([
      cv.arrayBuffer().then(Buffer.from),
      statement.arrayBuffer().then(Buffer.from),
      sample1.arrayBuffer().then(Buffer.from),
      sample2.arrayBuffer().then(Buffer.from),
    ]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
          4 documents are attached: CV, Statement of Interest, Sample Work 1, Sample Work 2.
        </p>
      `,
      attachments: [
        { filename: cv.name || "CV.pdf", content: cvBuf },
        { filename: statement.name || "Statement.pdf", content: statBuf },
        { filename: sample1.name || "Sample-Work-1.pdf", content: s1Buf },
        { filename: sample2.name || "Sample-Work-2.pdf", content: s2Buf },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Roster application error:", err);
    return NextResponse.json(
      { error: "Failed to send your application. Please try again." },
      { status: 500 }
    );
  }
}
