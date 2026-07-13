// HerVoice! — USSD session webhook (Africa's Talking)
//
// Africa's Talking POSTs application/x-www-form-urlencoded fields on every
// step of a session: sessionId, serviceCode, phoneNumber, text.
// `text` is the full input chain joined by "*" (e.g. "1*2*1"), so the menu
// tree is served statelessly. Responses are plain text: "CON ..." keeps the
// session open, "END ..." closes it.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CATEGORIES, ensureHerVoiceTable, hashPhone, newTrackingId,
  normaliseTrackingId, phoneTail, statusLabel, tokenOk,
} from "@/lib/hervoice";

const DISTRICTS = ["Thyolo", "Mzimba"];

function ussd(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET() {
  return NextResponse.json({
    service: "HerVoice! USSD webhook",
    status: "ready",
    usage: "Configure this URL as the USSD callback in Africa's Talking.",
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (!tokenOk(url)) return ussd("END Service unavailable.");

  let phone = "", text = "";
  try {
    const form = await req.formData();
    phone = String(form.get("phoneNumber") ?? "");
    text = String(form.get("text") ?? "").trim();
  } catch {
    return ussd("END Service unavailable.");
  }

  const steps = text === "" ? [] : text.split("*");

  // ── Main menu ──────────────────────────────────────────────────────────────
  if (steps.length === 0) {
    return ussd(
      "CON HerVoice! - Mawu Anu\n" +
        "1. Report a concern (anonymous)\n" +
        "2. Track my complaint\n" +
        "3. GBV help for me or someone\n" +
        "4. About this service"
    );
  }

  // ── 1. Report a concern ────────────────────────────────────────────────────
  if (steps[0] === "1") {
    if (steps.length === 1) {
      return ussd(
        "CON Select concern:\n" +
          CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")
      );
    }
    if (steps.length === 2) {
      const idx = parseInt(steps[1], 10);
      if (!idx || idx < 1 || idx > CATEGORIES.length) {
        return ussd("END Invalid choice. Please dial again and select a number from the list.");
      }
      return ussd("CON Which district?\n1. Thyolo\n2. Mzimba");
    }
    if (steps.length === 3) {
      const catIdx = parseInt(steps[1], 10);
      const distIdx = parseInt(steps[2], 10);
      if (!catIdx || catIdx < 1 || catIdx > CATEGORIES.length || !distIdx || distIdx < 1 || distIdx > 2) {
        return ussd("END Invalid choice. Please dial again and select a number from the list.");
      }
      await ensureHerVoiceTable();
      const trackingId = newTrackingId();
      await prisma.herVoiceReport.create({
        data: {
          trackingId,
          channel: "USSD",
          category: CATEGORIES[catIdx - 1],
          district: DISTRICTS[distIdx - 1],
          phoneHash: phone ? hashPhone(phone) : null,
          phoneTail: phone ? phoneTail(phone) : null,
        },
      });
      return ussd(
        `END Zikomo! Complaint received.\n` +
          `Tracking ID: ${trackingId}\n` +
          `You will NOT be identified. Unresolved reports escalate after 7 days. Track: option 2.`
      );
    }
  }

  // ── 2. Track a complaint ───────────────────────────────────────────────────
  if (steps[0] === "2") {
    if (steps.length === 1) {
      return ussd("CON Enter your tracking ID\n(e.g. CMP12345)");
    }
    const trackingId = normaliseTrackingId(steps.slice(1).join("*"));
    await ensureHerVoiceTable();
    const report = trackingId
      ? await prisma.herVoiceReport.findUnique({ where: { trackingId } })
      : null;
    return ussd(
      report
        ? `END ${report.trackingId}\nStatus: ${statusLabel(report.status)}\nSubmitted: ${report.createdAt.toISOString().slice(0, 10)}`
        : "END Tracking ID not found. Check the number (e.g. CMP12345) and dial again."
    );
  }

  // ── 3. GBV help ────────────────────────────────────────────────────────────
  if (steps[0] === "3") {
    return ussd(
      "END If you or someone is in danger, call 5600 now (free, 24hrs).\n" +
        "A trained advocate can meet you at a safe place. Your dial history shows only this code."
    );
  }

  // ── 4. About ───────────────────────────────────────────────────────────────
  if (steps[0] === "4") {
    return ussd(
      "END HerVoice! is a free, anonymous service for reporting GBV service problems in Thyolo & Mzimba. Run with district authorities. No airtime is charged."
    );
  }

  return ussd("END Invalid choice. Please dial again.");
}
