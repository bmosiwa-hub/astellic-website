/**
 * AI prompt templates for the Opportunity Intelligence Engine.
 * All prompts are Malawi-focused and calibrated to Astellic's three-pillar architecture.
 */

export const ASTELLIC_SYSTEM_CONTEXT = `You are an expert business development analyst for Astellic, an African development consulting firm operating in Malawi.

Astellic's three service pillars:
1. Evidence Generation & Verification — research & analytics, programme evaluation & learning, data quality & research integrity
2. Policy Development & Advisory — policy & strategy development, systems strengthening, knowledge translation & strategic communications
3. Programme Design & Implementation — programme design & innovation, technical assistance & institutional development, adaptive management & delivery

Astellic's four thematic domains:
- Health & Nutrition Systems
- Governance & Public Sector Reform
- Human Development & Social Systems (education, social protection, gender)
- Climate, Agriculture & Sustainability

Priority opportunity types for Astellic (in order):
1. CONSULTANCY — baseline/midline/endline evaluations, policy analysis, policy development, MERL, research assignments
2. GRANT — startup grants, institutional grants, innovation grants, programme grants
3. STARTUP_FUNDING — seed funding, pilot funding, challenge funds

Geographic focus: Malawi (primary), with regional Malawi/Africa relevance as secondary.

Malawi context: Astellic is an emerging consultancy. Opportunities best suited are those where:
- A smaller or newer firm can compete (not mega-contracts requiring decades of presence)
- Technical rigour and analytical depth are differentiators
- There is a strong thematic fit with health, governance, education, or climate in Malawi
- The funder operates in Malawi (FCDO, USAID, EU, World Bank, UNDP, UNICEF, GIZ, AfDB, Irish Aid, Norway, Gates Foundation, etc.)`;

// ── Stage 1: Extraction ───────────────────────────────────────────────────────

export function buildExtractionPrompt(rawData: {
  title: string;
  description?: string;
  content?: string;
  url: string;
  sourceName: string;
  sourceTags: string[];
}) {
  return {
    system: ASTELLIC_SYSTEM_CONTEXT,
    user: `Extract structured opportunity data from the raw scraped content below.

SOURCE: ${rawData.sourceName}
SOURCE TAGS: ${rawData.sourceTags.join(", ")}
URL: ${rawData.url}

RAW TITLE:
${rawData.title}

RAW DESCRIPTION:
${rawData.description ?? "(none)"}

RAW CONTENT (first 2000 chars):
${(rawData.content ?? "").slice(0, 2000)}

---
Return ONLY a valid JSON object (no markdown, no commentary) with this exact shape:
{
  "title": "clean opportunity title",
  "description": "2-4 sentence summary of what is being sought",
  "funder": "organisation name or null",
  "country": "Malawi or other country or null",
  "deadline": "ISO 8601 date string or null",
  "valueEstimate": "estimated contract value as string or null (e.g. '£500,000' or 'not stated')",
  "opportunityType": "CONSULTANCY | GRANT | STARTUP_FUNDING | null",
  "pillarTags": ["EVIDENCE_GENERATION", "POLICY_ADVISORY", "PROGRAMME_IMPLEMENTATION"],
  "thematicTags": ["HEALTH_NUTRITION", "GOVERNANCE_PUBLIC_SECTOR", "HUMAN_DEVELOPMENT", "CLIMATE_AGRICULTURE"],
  "isMalawiRelevant": true | false
}

Rules:
- pillarTags and thematicTags must be arrays (can be empty, can have multiple)
- opportunityType must be one of the three values or null
- deadline must be ISO 8601 or null — never guess
- isMalawiRelevant: true if explicitly Malawi or if regional Africa with Malawi-eligible`,
  };
}

// ── Stage 2: Analysis ─────────────────────────────────────────────────────────

export function buildAnalysisPrompt(structured: {
  title: string;
  description?: string;
  funder?: string;
  deadline?: string;
  valueEstimate?: string;
  opportunityType?: string;
  pillarTags: string[];
  thematicTags: string[];
  url: string;
}) {
  const today = new Date().toISOString().split("T")[0];

  return {
    system: ASTELLIC_SYSTEM_CONTEXT,
    user: `Analyse this funding/consultancy opportunity for strategic fit with Astellic.

TODAY: ${today}
TITLE: ${structured.title}
DESCRIPTION: ${structured.description ?? "(none)"}
FUNDER: ${structured.funder ?? "unknown"}
DEADLINE: ${structured.deadline ?? "not stated"}
ESTIMATED VALUE: ${structured.valueEstimate ?? "not stated"}
OPPORTUNITY TYPE: ${structured.opportunityType ?? "unknown"}
PILLAR TAGS: ${structured.pillarTags.join(", ") || "none"}
THEMATIC TAGS: ${structured.thematicTags.join(", ") || "none"}
SOURCE URL: ${structured.url}

---
Return ONLY a valid JSON object (no markdown, no commentary):
{
  "strategicFit": "HIGH | MEDIUM | LOW",
  "competitivenessScore": 1-10,
  "priorityScore": 1-10,
  "recommendation": "PURSUE | MONITOR | PASS",
  "rationale": "2-3 sentence explanation of recommendation",
  "strengths": ["up to 3 bullet points of why this suits Astellic"],
  "risks": ["up to 3 bullet points of risks or concerns"],
  "estimatedValue": "refined value estimate or null",
  "timeToDeadlineDays": integer or null
}

Scoring guidance:
- competitivenessScore: how well-positioned Astellic is to win (10 = perfect fit, small competition)
- priorityScore: urgency × strategic value × competitiveness (10 = must pursue immediately)
- PURSUE: high strategic fit, reasonable deadline, Astellic can win
- MONITOR: interesting but timing or competition not ideal
- PASS: poor fit, Malawi-irrelevant, or out of scope`,
  };
}
