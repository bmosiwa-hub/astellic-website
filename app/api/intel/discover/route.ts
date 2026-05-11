/**
 * POST /api/intel/discover
 * Called by the Railway crawler service to submit a newly discovered opportunity.
 * Handles deduplication and runs the full AI pipeline synchronously before responding.
 *
 * Note: pipeline runs synchronously (not fire-and-forget) because Vercel
 * terminates background work after the response is sent.
 *
 * Auth: Bearer token (INTEL_API_KEY env var)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashUrl, hashContent, checkDuplicate } from "@/lib/intel/dedup";
import { extractOpportunity, analyseOpportunity } from "@/lib/intel/ai-pipeline";
import { passesSourceFilters } from "@/lib/intel/filters";

// Allow up to 60s — AI pipeline takes 15-30s for two Claude calls
export const maxDuration = 60;

function authOk(req: NextRequest): boolean {
  const key = process.env.INTEL_API_KEY;
  if (!key) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${key}`;
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    sourceId: string;
    rawTitle: string;
    rawDescription?: string;
    rawUrl: string;
    rawPublishedAt?: string;
    rawDeadline?: string;
    rawFunder?: string;
    rawContent?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.sourceId || !body.rawTitle || !body.rawUrl) {
    return NextResponse.json({ error: "sourceId, rawTitle and rawUrl are required" }, { status: 400 });
  }

  // Verify source exists (fetch country + tags for pre-filter)
  const source = await prisma.crawlerSource.findUnique({
    where: { id: body.sourceId },
    select: { id: true, name: true, tags: true, country: true },
  });
  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  // ── Pre-AI qualification filter ───────────────────────────────────────────
  // Reject items that don't mention the source country or match any hint tag.
  const filter = passesSourceFilters(
    { country: source.country, tags: source.tags },
    { rawTitle: body.rawTitle, rawDescription: body.rawDescription, rawContent: body.rawContent }
  );
  if (!filter.passes) {
    return NextResponse.json({ status: "filtered", reason: filter.failReason });
  }

  const urlHash = hashUrl(body.rawUrl);
  const contentHash = body.rawContent ? hashContent(body.rawContent) : undefined;

  // Deduplicate
  const dedup = await checkDuplicate({ urlHash, contentHash, title: body.rawTitle });
  if (dedup.isDuplicate) {
    return NextResponse.json({
      status: "duplicate",
      duplicateOf: dedup.duplicateOf,
      reason: dedup.reason,
    });
  }

  // Create the discovered opportunity record
  const discovered = await prisma.discoveredOpportunity.create({
    data: {
      sourceId:      body.sourceId,
      rawTitle:      body.rawTitle,
      rawDescription:body.rawDescription,
      rawUrl:        body.rawUrl,
      rawPublishedAt:body.rawPublishedAt ? new Date(body.rawPublishedAt) : null,
      rawDeadline:   body.rawDeadline,
      rawFunder:     body.rawFunder,
      rawContent:    body.rawContent,
      urlHash,
      contentHash,
      status: "NEW",
    },
  });

  // ── Stage 1: Extract structured data ──────────────────────────────────────
  let extracted;
  try {
    extracted = await extractOpportunity({
      title:      body.rawTitle,
      description:body.rawDescription,
      content:    body.rawContent,
      url:        body.rawUrl,
      sourceName: source.name,
      sourceTags: source.tags,
    });
  } catch (err) {
    console.error(`[intel] Extraction failed for ${discovered.id}:`, err);
    // Return accepted so crawler doesn't retry — record sits as NEW for manual re-analysis
    return NextResponse.json({ status: "accepted", id: discovered.id, stage: "extraction_failed" });
  }

  // Parse deadline
  let deadlineParsed: Date | null = null;
  if (extracted.deadline) {
    const d = new Date(extracted.deadline);
    if (!isNaN(d.getTime())) deadlineParsed = d;
  }

  // Update record with extracted structured data
  await prisma.discoveredOpportunity.update({
    where: { id: discovered.id },
    data: {
      title:          extracted.title,
      description:    extracted.description,
      funder:         extracted.funder,
      country:        extracted.country,
      deadline:       deadlineParsed,
      valueEstimate:  extracted.valueEstimate,
      opportunityType:extracted.opportunityType as any,
      pillarTags:     extracted.pillarTags as any,
      thematicTags:   extracted.thematicTags as any,
    },
  });

  // ── Stage 2: Analyse strategic fit ────────────────────────────────────────
  let analysis;
  try {
    analysis = await analyseOpportunity({
      title:          extracted.title,
      description:    extracted.description ?? undefined,
      funder:         extracted.funder ?? undefined,
      deadline:       extracted.deadline ?? undefined,
      valueEstimate:  extracted.valueEstimate ?? undefined,
      opportunityType:extracted.opportunityType ?? undefined,
      pillarTags:     extracted.pillarTags,
      thematicTags:   extracted.thematicTags,
      url:            body.rawUrl,
    });
  } catch (err) {
    console.error(`[intel] Analysis failed for ${discovered.id}:`, err);
    // Extraction succeeded — record has structured data, just no analysis yet
    return NextResponse.json({ status: "accepted", id: discovered.id, stage: "analysis_failed" });
  }

  await prisma.opportunityAnalysis.create({
    data: {
      discoveredOpId:      discovered.id,
      strategicFit:        analysis.strategicFit as any,
      competitivenessScore:analysis.competitivenessScore,
      priorityScore:       analysis.priorityScore,
      recommendation:      analysis.recommendation,
      rationale:           analysis.rationale,
      strengths:           analysis.strengths,
      risks:               analysis.risks,
      estimatedValue:      analysis.estimatedValue,
      timeToDeadlineDays:  analysis.timeToDeadlineDays,
    },
  });

  // Mark as fully reviewed
  await prisma.discoveredOpportunity.update({
    where: { id: discovered.id },
    data: { status: "REVIEWED" },
  });

  return NextResponse.json({
    status:         "accepted",
    id:             discovered.id,
    recommendation: analysis.recommendation,
    priorityScore:  analysis.priorityScore,
  });
}
