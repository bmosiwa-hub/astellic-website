/**
 * Two-stage AI pipeline for opportunity processing.
 * Stage 1: Extract structured data from raw scraped content.
 * Stage 2: Analyse strategic fit and produce recommendation.
 *
 * Uses Anthropic API via fetch (no SDK dependency needed).
 */

import { buildExtractionPrompt, buildAnalysisPrompt } from "./prompts";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-5";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

async function callClaude(system: string, user: string): Promise<string> {
  const messages: AnthropicMessage[] = [{ role: "user", content: user }];

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

function parseJsonResponse<T>(text: string): T {
  // Strip markdown code fences if present
  const clean = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();
  return JSON.parse(clean) as T;
}

// ── Stage 1: Extraction ───────────────────────────────────────────────────────

export interface ExtractedOpportunity {
  title: string;
  description: string | null;
  funder: string | null;
  country: string | null;
  deadline: string | null;
  valueEstimate: string | null;
  opportunityType: "CONSULTANCY" | "GRANT" | "STARTUP_FUNDING" | null;
  pillarTags: string[];
  thematicTags: string[];
  isMalawiRelevant: boolean;
}

export async function extractOpportunity(rawData: {
  title: string;
  description?: string;
  content?: string;
  url: string;
  sourceName: string;
  sourceTags: string[];
}): Promise<ExtractedOpportunity> {
  const { system, user } = buildExtractionPrompt(rawData);
  const text = await callClaude(system, user);
  const parsed = parseJsonResponse<ExtractedOpportunity>(text);

  return {
    title: parsed.title ?? rawData.title,
    description: parsed.description ?? null,
    funder: parsed.funder ?? null,
    country: parsed.country ?? null,
    deadline: parsed.deadline ?? null,
    valueEstimate: parsed.valueEstimate ?? null,
    opportunityType: parsed.opportunityType ?? null,
    pillarTags: Array.isArray(parsed.pillarTags) ? parsed.pillarTags : [],
    thematicTags: Array.isArray(parsed.thematicTags) ? parsed.thematicTags : [],
    isMalawiRelevant: parsed.isMalawiRelevant ?? false,
  };
}

// ── Stage 2: Analysis ─────────────────────────────────────────────────────────

export interface OpportunityAnalysisResult {
  strategicFit: "HIGH" | "MEDIUM" | "LOW";
  competitivenessScore: number;
  priorityScore: number;
  recommendation: "PURSUE" | "MONITOR" | "PASS";
  rationale: string | null;
  strengths: string[];
  risks: string[];
  estimatedValue: string | null;
  timeToDeadlineDays: number | null;
}

export async function analyseOpportunity(structured: {
  title: string;
  description?: string;
  funder?: string;
  deadline?: string;
  valueEstimate?: string;
  opportunityType?: string;
  pillarTags: string[];
  thematicTags: string[];
  url: string;
}): Promise<OpportunityAnalysisResult> {
  const { system, user } = buildAnalysisPrompt(structured);
  const text = await callClaude(system, user);
  const parsed = parseJsonResponse<OpportunityAnalysisResult>(text);

  return {
    strategicFit: parsed.strategicFit ?? "LOW",
    competitivenessScore: Math.min(10, Math.max(1, Number(parsed.competitivenessScore) || 5)),
    priorityScore: Math.min(10, Math.max(1, Number(parsed.priorityScore) || 5)),
    recommendation: parsed.recommendation ?? "PASS",
    rationale: parsed.rationale ?? null,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    estimatedValue: parsed.estimatedValue ?? null,
    timeToDeadlineDays: parsed.timeToDeadlineDays ?? null,
  };
}
