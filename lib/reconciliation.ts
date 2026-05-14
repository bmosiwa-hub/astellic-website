/**
 * Phase 14 — Bank Reconciliation
 *
 * Shared types and matching logic for the bank reconciliation module.
 */

import type { BankTransaction } from "@prisma/client";

// ── CSV parsing ───────────────────────────────────────────────────────────────

export interface ParsedBankRow {
  transactionDate: Date;
  description:     string;
  debit:           number | null;  // cash out (positive)
  credit:          number | null;  // cash in (positive)
  balance:         number | null;
}

/**
 * Parse a CSV bank statement into structured rows.
 *
 * Supports two common formats:
 *   Format A: Date, Description, Debit, Credit, Balance
 *   Format B: Date, Description, Amount (positive=credit, negative=debit), Balance
 *
 * Returns an array of rows or throws with a descriptive error.
 */
export function parseBankCSV(csv: string): ParsedBankRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

  // Detect header
  const header = lines[0].toLowerCase().split(",").map((h) => h.replace(/"/g, "").trim());

  const dateIdx        = header.findIndex((h) => /date/i.test(h));
  const descIdx        = header.findIndex((h) => /desc|narr|detail|particulars/i.test(h));
  const debitIdx       = header.findIndex((h) => /debit|withdrawa?l|dr/i.test(h));
  const creditIdx      = header.findIndex((h) => /credit|deposit|cr/i.test(h));
  const amountIdx      = header.findIndex((h) => /^amount$/i.test(h));
  const balanceIdx     = header.findIndex((h) => /balance|bal/i.test(h));

  if (dateIdx === -1) throw new Error("CSV must contain a 'Date' column.");
  if (descIdx === -1) throw new Error("CSV must contain a 'Description' / 'Narration' column.");
  if (debitIdx === -1 && creditIdx === -1 && amountIdx === -1) {
    throw new Error("CSV must contain Debit/Credit columns or an Amount column.");
  }

  const rows: ParsedBankRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = col(cols, dateIdx);
    if (!rawDate) continue; // blank row

    const transactionDate = parseDate(rawDate);
    if (!transactionDate) continue; // invalid date — skip

    const description = col(cols, descIdx) || `Row ${i}`;

    let debit:   number | null = null;
    let credit:  number | null = null;
    let balance: number | null = null;

    if (debitIdx  !== -1) debit  = parseAmount(col(cols, debitIdx));
    if (creditIdx !== -1) credit = parseAmount(col(cols, creditIdx));
    if (amountIdx !== -1) {
      const amt = parseAmount(col(cols, amountIdx));
      if (amt !== null) {
        if (amt < 0) debit  = Math.abs(amt);
        else         credit = amt;
      }
    }
    if (balanceIdx !== -1) balance = parseAmount(col(cols, balanceIdx));

    rows.push({ transactionDate, description, debit, credit, balance });
  }

  if (rows.length === 0) throw new Error("No valid data rows found in the CSV.");
  return rows;
}

function col(cols: string[], idx: number): string {
  if (idx < 0 || idx >= cols.length) return "";
  return cols[idx].replace(/^"|"$/g, "").trim();
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? null : n;
}

function parseDate(raw: string): Date | null {
  // Supports: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, D MMM YYYY, etc.
  const cleaned = raw.replace(/"/g, "").trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;
  // Try DD/MM/YYYY
  const dmy = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`);
  return null;
}

function splitCSVLine(line: string): string[] {
  const cols: string[] = [];
  let inQuote = false;
  let current = "";
  for (const ch of line) {
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      cols.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cols.push(current);
  return cols;
}

// ── Auto-matching ──────────────────────────────────────────────────────────────

export interface MatchCandidate {
  entityType: "Income" | "Expense" | "Payroll" | "AccountPayable";
  entityId:   string;
  date:       Date;
  amount:     number;        // positive number
  description: string;
  currency:   string;
}

/**
 * Find the best system-record match for a bank transaction row.
 * Returns the candidate if a match is found within tolerances, else null.
 *
 * Tolerances:
 *   - Date: ±3 calendar days
 *   - Amount: within 1% of each other (or ≤ 50 MWK diff for small amounts)
 */
export function findBestMatch(
  tx:         Pick<BankTransaction, "transactionDate" | "debit" | "credit">,
  candidates: MatchCandidate[],
): MatchCandidate | null {
  const txAmount = (tx.credit ?? 0) > 0 ? tx.credit! : tx.debit ?? 0;
  if (txAmount === 0) return null;

  const txDate   = new Date(tx.transactionDate);
  const DATE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

  let best: MatchCandidate | null = null;
  let bestScore = Infinity;

  for (const c of candidates) {
    // Date tolerance
    const dateDiff = Math.abs(txDate.getTime() - c.date.getTime());
    if (dateDiff > DATE_WINDOW_MS) continue;

    // Amount tolerance
    const amtDiff    = Math.abs(txAmount - c.amount);
    const amtPct     = c.amount > 0 ? amtDiff / c.amount : Infinity;
    const amtOk      = amtPct <= 0.01 || amtDiff <= 50;
    if (!amtOk) continue;

    // Score: days × 1000 + amount diff (prefers closer date then closer amount)
    const score = (dateDiff / 86400000) * 1000 + amtDiff;
    if (score < bestScore) {
      bestScore = score;
      best      = c;
    }
  }

  return best;
}
