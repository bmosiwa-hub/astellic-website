/**
 * Pre-AI qualification filters.
 * Applied before any DB write or AI call — fast, text-based checks only.
 *
 * Rules:
 *  1. COUNTRY — if the source has a country set, that country name must appear
 *               in the raw text (title + description + content). Case-insensitive.
 *  2. TAGS    — at least one word from the source's hint tags must appear in
 *               the raw text. Each tag is split into individual words so
 *               "baseline evaluation" contributes "baseline" AND "evaluation".
 */

export interface RawOpportunity {
  rawTitle:       string;
  rawDescription?: string;
  rawContent?:    string;
}

export interface FilterSource {
  country: string;  // e.g. "Malawi"
  tags:    string[]; // e.g. ["consultancy", "baseline evaluation", "Malawi"]
}

export interface FilterResult {
  passes:         boolean;
  failReason?:    "COUNTRY" | "TAGS";
  matchedCountry?: string;
  matchedTag?:    string;
}

/**
 * Returns true if the raw opportunity passes both the country and tag filters
 * for the given source.
 */
export function passesSourceFilters(
  source: FilterSource,
  raw: RawOpportunity
): FilterResult {
  // Combine all searchable text into one lowercase blob
  const blob = [raw.rawTitle, raw.rawDescription, raw.rawContent]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // ── 1. Country filter ─────────────────────────────────────────────────────
  const country = source.country.trim();
  if (country) {
    if (!containsWord(blob, country)) {
      return { passes: false, failReason: "COUNTRY" };
    }
  }

  // ── 2. Tag filter ─────────────────────────────────────────────────────────
  if (source.tags.length > 0) {
    // Flatten all tags into individual words
    const tagWords = source.tags
      .flatMap((tag) => tag.toLowerCase().split(/[\s,]+/))
      .filter((w) => w.length > 2); // ignore tiny words like "of", "in"

    const matched = tagWords.find((word) => blob.includes(word));
    if (!matched) {
      return { passes: false, failReason: "TAGS" };
    }
    return { passes: true, matchedCountry: country || undefined, matchedTag: matched };
  }

  return { passes: true, matchedCountry: country || undefined };
}

/**
 * Case-insensitive whole-word check.
 * "Malawi" matches "in Malawi," but not "MalawianFund".
 */
function containsWord(text: string, word: string): boolean {
  const escaped = word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // word boundary: preceded/followed by non-alphanumeric or start/end
  const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
  return re.test(text);
}
