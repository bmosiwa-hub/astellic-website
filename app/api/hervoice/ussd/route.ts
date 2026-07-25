// HerVoice! — USSD session webhook (Africa's Talking)
//
// Africa's Talking POSTs application/x-www-form-urlencoded fields on every
// step of a session: sessionId, serviceCode, phoneNumber, text.
// `text` is the full input chain joined by "*" (e.g. "1*2*1"), so the menu
// tree is served statelessly. Responses are plain text: "CON ..." keeps the
// session open, "END ..." closes it.
//
// Flow:
//   1. Report GBV case      → District → TA → GVH → Village → tracking ID,
//                             and the district's duty advocate is notified
//                             by SMS with the village-level location.
//   2. Report service problem → category → district → tracking ID
//   3. Track my report        → enter tracking ID
//   4. Emergency help         → crisis line

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CATEGORIES, GAZETTEER, ensureHerVoiceTable, hashPhone, newTrackingId,
  normaliseTrackingId, notifyAdvocate, phoneTail, statusLabel, tokenOk,
  villagesForGvh,
} from "@/lib/hervoice";

const DISTRICTS = Object.keys(GAZETTEER); // ["Thyolo", "Mzimba"]

function ussd(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function menu(title: string, options: string[]): NextResponse {
  return ussd(`CON ${title}\n` + options.map((o, i) => `${i + 1}. ${o}`).join("\n"));
}

/** Returns the chosen option, or null if the input is not a valid index. */
function choose<T>(options: T[], input: string): T | null {
  const idx = parseInt(input, 10);
  return idx >= 1 && idx <= options.length ? options[idx - 1] : null;
}

const INVALID = "END Invalid choice. Please dial again and select a number from the list.";

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
    return menu("HerVoice! - Mawu Anu", [
      "Report GBV case (for me or someone)",
      "Report a service problem",
      "Track my report",
      "Emergency help",
    ]);
  }

  // ── 1. Report GBV case: District → TA → GVH → Village ─────────────────────
  if (steps[0] === "1") {
    // Step 1: district
    if (steps.length === 1) {
      return menu("Which district?", DISTRICTS);
    }
    const district = choose(DISTRICTS, steps[1]);
    if (!district) return ussd(INVALID);
    const tas = Object.keys(GAZETTEER[district]);

    // Step 2: Traditional Authority
    if (steps.length === 2) {
      return menu(`TA in ${district}?`, tas);
    }
    const ta = choose(tas, steps[2]);
    if (!ta) return ussd(INVALID);
    const gvhs = GAZETTEER[district][ta];

    // Step 3: Group Village Head
    if (steps.length === 3) {
      return menu(`Group Village Head (GVH) in TA ${ta}?`, gvhs);
    }
    const gvh = choose(gvhs, steps[3]);
    if (!gvh) return ussd(INVALID);
    const villages = villagesForGvh(gvh);

    // Step 4: Village
    if (steps.length === 4) {
      return menu(`Village under GVH ${gvh}?`, villages);
    }
    const village = choose(villages, steps[4]);
    if (!village) return ussd(INVALID);

    // Step 5: name (free text) — needed so the advocate can find the survivor
    if (steps.length === 5) {
      return ussd(
        "CON Enter your name\n(or the name of the person you are reporting for)"
      );
    }
    const survivorName = steps.slice(5).join(" ").trim();
    if (!survivorName) {
      return ussd("CON Please enter a name so the advocate can find you:");
    }

    // Submit
    await ensureHerVoiceTable();
    const trackingId = newTrackingId();
    const report = await prisma.herVoiceReport.create({
      data: {
        trackingId,
        channel: "USSD",
        reportType: "CASE",
        district,
        ta,
        gvh,
        village,
        survivorName,
        phoneHash: phone ? hashPhone(phone) : null,
        phoneTail: phone ? phoneTail(phone) : null,
      },
    });
    const notified = await notifyAdvocate(report);
    if (notified) {
      await prisma.herVoiceReport.update({
        where: { id: report.id },
        data: { advocateNotified: true },
      });
    }
    return ussd(
      `END Zikomo. Case received.\n` +
        `Tracking ID: ${trackingId}\n` +
        `A survivor advocate serving ${village} village, TA ${ta} will follow up within 24 hrs. If in danger call 5600 (free).`
    );
  }

  // ── 2. Report a service problem: category → district ───────────────────────
  if (steps[0] === "2") {
    if (steps.length === 1) {
      return menu("Select problem:", [...CATEGORIES]);
    }
    const category = choose([...CATEGORIES], steps[1]);
    if (!category) return ussd(INVALID);

    if (steps.length === 2) {
      return menu("Which district?", DISTRICTS);
    }
    const district = choose(DISTRICTS, steps[2]);
    if (!district) return ussd(INVALID);

    await ensureHerVoiceTable();
    const trackingId = newTrackingId();
    await prisma.herVoiceReport.create({
      data: {
        trackingId,
        channel: "USSD",
        reportType: "COMPLAINT",
        category,
        district,
        phoneHash: phone ? hashPhone(phone) : null,
        phoneTail: phone ? phoneTail(phone) : null,
      },
    });
    return ussd(
      `END Zikomo! Complaint received.\n` +
        `Tracking ID: ${trackingId}\n` +
        `You will NOT be identified. Unresolved reports escalate after 7 days.`
    );
  }

  // ── 3. Track a report ──────────────────────────────────────────────────────
  if (steps[0] === "3") {
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

  // ── 4. Emergency help ──────────────────────────────────────────────────────
  if (steps[0] === "4") {
    return ussd(
      "END If you or someone is in danger, call 5600 now (free, 24hrs).\n" +
        "A trained advocate can meet you at a safe place. Your dial history shows only this code."
    );
  }

  return ussd("END Invalid choice. Please dial again.");
}
