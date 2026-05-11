/**
 * POST /api/intel/discover
 * Called by the Railway crawler service to submit a newly discovered opportunity.
 * Handles deduplication and queues AI extraction.
 *
 * Auth: Bearer token (INTEL_API_KEY env var)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashUrl, hashContent, checkDuplicate } from "@/lib/intel/dedup";
import { extractOpportunity, analyseOpportunity } from "@/lib/intel/ai-pipeline";

function authOk(req: NextRequest): boolean {
  const key = process.env.INTEL_API_KEY;
  if (!key) return false; // no key configured → reject all
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

  // Verify source exists
  const source = await prisma.crawlerSource.findUnique({
    where: { id: body.sourceId },
    select: { id: true, name: true, tags: true },
  });
  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  const urlHash = hashUrl(body.rawUrl);
  const contentHash = body.rawContent ? hashContent(body.rawContent) : undefined;

  // Deduplicate
  const dedup = await checkDuplicate({
    urlHash,
    contentHash,
    title: body.rawTitle,
  });

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
      sourceId: body.sourceId,
      rawTitle: body.rawTitle,
      rawDescription: body.rawDescription,
      rawUrl: body.rawUrl,
      rawPublishedAt: body.rawPublishedAt ? new Date(body.rawPublishedAt) : null,
      rawDeadline: body.rawDeadline,
      rawFunder: body.rawFunder,
      rawContent: body.rawContent,
      urlHash,
      contentHash,
      status: "NEW",
    },
  });

  // Run AI pipeline asynchronously (non-blocking response)
  runAIPipeline(discovered.id, source, body).catch((err) => {
    console.error(`[intel] AI pipeline failed for ${discovered.id}:`, err);
  });

  return NextResponse.json({ status: "accepted", id: discovered.id });
}

async function runAIPipeline(
  discoveredId: string,
  source: { name: string; tags: string[] },
  raw: {
    rawTitle: string;
    rawDescription?: string;
    rawUrl: string;
    rawDeadline?: string;
    rawFunder?: string;
    rawContent?: string;
  }
) {
  // Stage 1: Extract structured data
  let extracted;
  try {
    extracted = await extractOpportunity({
      title: raw.rawTitle,
      description: raw.rawDescription,
      content: raw.rawContent,
      url: raw.rawUrl,
      sourceName: source.name,
      sourceTags: source.tags,
    });
  } catch (err) {
    console.error(`[intel] Extraction failed for ${discoveredId}:`, err);
    return;
  }

  // Skip if not Malawi-relevant
  if (!extracted.isMalawiRelevant) {
    await prisma.discoveredOpportunity.update({
      where: { id: discoveredId },
      data: { status: "IGNORED" },
    });
    return;
  }

  // Parse deadline
  let deadlineParsed: Date | null = null;
  if (extracted.deadline) {
    const d = new Date(extracted.deadline);
    if (!isNaN(d.getTime())) deadlineParsed = d;
  }

  // Update with extracted data
  await prisma.discoveredOpportunity.update({
    where: { id: discoveredId },
    data: {
      title: extracted.title,
      description: extracted.description,
      funder: extracted.funder,
      country: extracted.country,
      deadline: deadlineParsed,
      valueEstimate: extracted.valueEstimate,
      opportunityType: extracted.opportunityType as any,
      pillarTags: extracted.pillarTags as any,
      thematicTags: extracted.thematicTags as any,
    },
  });

  // Stage 2: Analyse strategic fit
  let analysis;
  try {
    analysis = await analyseOpportunity({
      title: extracted.title,
      description: extracted.description ?? undefined,
      funder: extracted.funder ?? undefined,
      deadline: extracted.deadline ?? undefined,
      valueEstimate: extracted.valueEstimate ?? undefined,
      opportunityType: extracted.opportunityType ?? undefined,
      pillarTags: extracted.pillarTags,
      thematicTags: extracted.thematicTags,
      url: raw.rawUrl,
    });
  } catch (err) {
    console.error(`[intel] Analysis failed for ${discoveredId}:`, err);
    return;
  }

  await prisma.opportunityAnalysis.create({
    data: {
      discoveredOpId: discoveredId,
      strategicFit: analysis.strategicFit as any,
      competitivenessScore: analysis.competitivenessScore,
      priorityScore: analysis.priorityScore,
      recommendation: analysis.recommendation,
      rationale: analysis.rationale,
      strengths: analysis.strengths,
      risks: analysis.risks,
      estimatedValue: analysis.estimatedValue,
      timeToDeadlineDays: analysis.timeToDeadlineDays,
    },
  });

  // Promote to REVIEWED status once AI has processed
  await prisma.discoveredOpportunity.update({
    where: { id: discoveredId },
    data: { status: "REVIEWED" },
  });
}
