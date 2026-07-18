import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimitOk, clientIp } from "@/lib/simple-rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  try {
    if (!rateLimitOk(`partnership:${clientIp(request)}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const organisation = (formData.get("organisation") as string)?.trim();
    const proposal = (formData.get("proposal") as string)?.trim();
    const doc1 = formData.get("doc1") as File | null;
    const doc2 = formData.get("doc2") as File | null;

    // Server-side validation — documents are optional
    if (!name || !email || !organisation || !proposal) {
      return NextResponse.json(
        { error: "Name, email, organisation, and proposal description are required." },
        { status: 400 }
      );
    }

    // Check file sizes if provided
    const optionalFiles = [
      { file: doc1, label: "Supporting Document 1" },
      { file: doc2, label: "Supporting Document 2" },
    ];

    for (const { file, label } of optionalFiles) {
      if (file && file.size > 0 && file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${label} exceeds the 20 MB file size limit.` },
          { status: 400 }
        );
      }
    }

    // Convert files to buffers where present
    const attachments: { filename: string; content: Buffer }[] = [];

    if (doc1 && doc1.size > 0) {
      const buf = Buffer.from(await doc1.arrayBuffer());
      attachments.push({ filename: doc1.name || "Supporting-Document-1.pdf", content: buf });
    }
    if (doc2 && doc2.size > 0) {
      const buf = Buffer.from(await doc2.arrayBuffer());
      attachments.push({ filename: doc2.name || "Supporting-Document-2.pdf", content: buf });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
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
      from: `"Astellic Partnership Enquiries" <${process.env.SMTP_USER}>`,
      replyTo: `"${name}" <${email}>`,
      to: process.env.PARTNERSHIP_EMAIL,
      subject: `Partnership Proposal`,
      html: `
        <h2 style="color:#1B2A4A;">Partnership Proposal</h2>
        <table style="font-family:sans-serif;font-size:15px;line-height:1.6;">
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name</td><td>${name}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Organisation</td><td>${organisation}</td></tr>
        </table>
        <h3 style="color:#1B2A4A;margin-top:20px;font-family:sans-serif;">Proposed Partnership</h3>
        <p style="font-family:sans-serif;font-size:15px;line-height:1.7;white-space:pre-wrap;">${proposal}</p>
        ${attachments.length > 0 ? `<p style="margin-top:16px;color:#555;font-size:14px;font-family:sans-serif;">${attachments.length} supporting document${attachments.length > 1 ? "s are" : " is"} attached.</p>` : ""}
      `,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Partnership proposal error:", message);
    return NextResponse.json(
      { error: `Delivery failed: ${message}` },
      { status: 500 }
    );
  }
}
