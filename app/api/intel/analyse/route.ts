/**
 * POST /api/intel/analyse
 * Re-run AI analysis on a specific discovered opportunity (for re-analysis from UI).
 * Auth: session-based (must be logged-in CEO or user with bizdev permission).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyseOpportunity } from "@/lib/intel/ai-pipeline";
import { extractOpportunity } from "@/lib/intel/ai-pipeline";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const discovered = await prisma.discoveredOpportunity.findUnique({
    where: { id },
    include: { source: { select: { name: true, tags: true } } },
  });
  if (!discovered) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    // Re-extract if no structured title
    let extracted = {
      title: discovered.title ?? discovered.rawTitle,
      description: discovered.description ?? discovered.rawDescription ?? undefined,
      funder: discovered.funder ?? discovered.rawFunder ?? undefined,
      deadline: discovered.deadline?.toISOString() ?? undefined,
      valueEstimate: discovered.valueEstimate ?? undefined,
      opportunityType: discovered.opportunityType ?? undefined,
      pillarTags: discovered.pillarTags as string[],
      thematicTags: discovered.thematicTags as string[],
    };

    if (!discovered.title) {
      const ex = await extractOpportunity({
        title: discovered.rawTitle,
        description: discovered.rawDescription ?? undefined,
        content: discovered.rawContent ?? undefined,
        url: discovered.rawUrl,
        sourceName: discovered.source.name,
        sourceTags: discovered.source.tags,
      });
      extracted = {
        title: ex.title,
        description: ex.description ?? undefined,
        funder: ex.funder ?? undefined,
        deadline: ex.deadline ?? undefined,
        valueEstimate: ex.valueEstimate ?? undefined,
        opportunityType: ex.opportunityType ?? undefined,
        pillarTags: ex.pillarTags,
        thematicTags: ex.thematicTags,
      };
      // Update with fresh extraction
      await prisma.discoveredOpportunity.update({
        where: { id },
        data: {
          title: ex.title,
          description: ex.description,
          funder: ex.funder,
          valueEstimate: ex.valueEstimate,
          opportunityType: ex.opportunityType as any,
          pillarTags: ex.pillarTags as any,
          thematicTags: ex.thematicTags as any,
        },
      });
    }

    const analysis = await analyseOpportunity({
      ...extracted,
      url: discovered.rawUrl,
    });

    // Upsert analysis
    await prisma.opportunityAnalysis.upsert({
      where: { discoveredOpId: id },
      create: {
        discoveredOpId: id,
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
      update: {
        strategicFit: analysis.strategicFit as any,
        competitivenessScore: analysis.competitivenessScore,
        priorityScore: analysis.priorityScore,
        recommendation: analysis.recommendation,
        rationale: analysis.rationale,
        strengths: analysis.strengths,
        risks: analysis.risks,
        estimatedValue: analysis.estimatedValue,
        timeToDeadlineDays: analysis.timeToDeadlineDays,
        analysedAt: new Date(),
      },
    });

    if (discovered.status === "NEW") {
      await prisma.discoveredOpportunity.update({
        where: { id },
        data: { status: "REVIEWED" },
      });
    }

    return NextResponse.json({ status: "ok", recommendation: analysis.recommendation });
  } catch (err) {
    console.error("[intel/analyse] error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
