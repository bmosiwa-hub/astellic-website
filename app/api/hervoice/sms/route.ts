// HerVoice! — inbound SMS webhook (Africa's Talking)
//
// Africa's Talking POSTs application/x-www-form-urlencoded fields:
//   from, to, text, date, id, linkId
// Keywords:
//   REPORT <details>  → stores an anonymous report, replies with tracking ID
//   STATUS <CMP-id>   → replies with the report's current status
//   anything else     → usage guidance
//
// Replies are sent via the AT Send SMS API when AT_USERNAME/AT_API_KEY are
// configured; reports are stored either way.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureHerVoiceTable, guessCategory, hashPhone, newTrackingId,
  normaliseTrackingId, phoneTail, sendSms, statusLabel, tokenOk,
} from "@/lib/hervoice";

export async function GET(req: NextRequest) {
  // Lets you verify the callback URL in a browser.
  return NextResponse.json({
    service: "HerVoice! inbound SMS webhook",
    status: "ready",
    usage: "Configure this URL as the incoming-messages callback in Africa's Talking.",
    keywords: ["REPORT <details>", "STATUS <tracking id>"],
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (!tokenOk(url)) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  let from = "", text = "";
  try {
    const form = await req.formData();
    from = String(form.get("from") ?? "");
    text = String(form.get("text") ?? "").trim();
  } catch {
    return NextResponse.json({ error: "expected form-encoded body" }, { status: 400 });
  }

  if (!text) return NextResponse.json({ ok: true, action: "ignored-empty" });

  await ensureHerVoiceTable();

  // ── STATUS <id> ────────────────────────────────────────────────────────────
  if (/^status\b/i.test(text)) {
    const trackingId = normaliseTrackingId(text);
    const report = trackingId
      ? await prisma.herVoiceReport.findUnique({ where: { trackingId } })
      : null;
    const reply = report
      ? `HerVoice!: ${report.trackingId} - ${statusLabel(report.status)}. Submitted ${report.createdAt.toISOString().slice(0, 10)}. Unresolved reports escalate automatically after 7 days.`
      : `HerVoice!: We could not find that tracking ID. Check the format (e.g. STATUS CMP-12345) and try again. This service is free.`;
    const sent = await sendSms(from, reply);
    return NextResponse.json({ ok: true, action: "status", trackingId, replySent: sent });
  }

  // ── REPORT <details> ───────────────────────────────────────────────────────
  if (/^report\b/i.test(text)) {
    const details = text.replace(/^report\s*/i, "").trim();
    const trackingId = newTrackingId();
    await prisma.herVoiceReport.create({
      data: {
        trackingId,
        channel: "SMS",
        category: guessCategory(details),
        message: details || null,
        phoneHash: from ? hashPhone(from) : null,
        phoneTail: from ? phoneTail(from) : null,
      },
    });
    const reply = `Zikomo! Your report was received and routed to the District Gender Office. Tracking ID: ${trackingId}. Reply STATUS ${trackingId} anytime. You will NOT be identified. If in danger call 5600 (free).`;
    const sent = await sendSms(from, reply);
    return NextResponse.json({ ok: true, action: "report", trackingId, replySent: sent });
  }

  // ── Anything else: guidance ────────────────────────────────────────────────
  const reply = `HerVoice!: Start your message with REPORT to file a concern (e.g. REPORT no medicine at the clinic) or STATUS <ID> to track one. Free & anonymous. Emergencies: call 5600.`;
  const sent = await sendSms(from, reply);
  return NextResponse.json({ ok: true, action: "help", replySent: sent });
}
