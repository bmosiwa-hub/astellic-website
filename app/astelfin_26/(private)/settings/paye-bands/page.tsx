/**
 * /settings/paye-bands
 * CEO-only page for managing versioned PAYE band sets.
 *
 * Features:
 *  - List all band sets (ordered by effectiveFrom desc)
 *  - Create new band set with custom bands
 *  - View/expand individual band sets
 *  - One-click seed of the current 2024 MRA bands (shown when no sets exist)
 */

import { auth }     from "@/auth";
import { prisma }   from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link         from "next/link";
import { revalidatePath } from "next/cache";
import { HARDCODED_BANDS } from "@/lib/paye";

// ── Server actions ────────────────────────────────────────────────────────────

async function seedCurrentBands(_formData: FormData) {
  "use server";
  const session = await auth();
  if (session?.user?.role !== "CEO") redirect("/astelfin_26/dashboard");

  await prisma.pAYEBandSet.create({
    data: {
      label:         "MRA Bands 2024/25 (default)",
      effectiveFrom: new Date("2024-01-01"),
      bands: {
        create: HARDCODED_BANDS.map((b) => ({
          order:      b.order,
          fromAmount: b.fromAmount,
          toAmount:   b.toAmount,
          rate:       b.rate,
        })),
      },
    },
  });

  revalidatePath("/astelfin_26/settings/paye-bands");
}

async function createBandSet(formData: FormData) {
  "use server";
  const session = await auth();
  if (session?.user?.role !== "CEO") redirect("/astelfin_26/dashboard");

  const label         = (formData.get("label")         as string)?.trim();
  const effectiveFrom = formData.get("effectiveFrom")  as string;
  const bandsJson     = formData.get("bandsJson")       as string;

  if (!label || !effectiveFrom || !bandsJson) return;

  let bands: Array<{ fromAmount: number; toAmount: number | null; rate: number }>;
  try {
    bands = JSON.parse(bandsJson);
  } catch {
    return;
  }

  await prisma.pAYEBandSet.create({
    data: {
      label,
      effectiveFrom: new Date(effectiveFrom),
      bands: {
        create: bands.map((b, i) => ({
          order:      i + 1,
          fromAmount: b.fromAmount,
          toAmount:   b.toAmount ?? null,
          rate:       b.rate,
        })),
      },
    },
  });

  revalidatePath("/astelfin_26/settings/paye-bands");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(n: number | null): string {
  if (n === null) return "No limit";
  return `MWK ${n.toLocaleString()}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PAYEBandsPage() {
  const session = await auth();
  if (session?.user?.role !== "CEO") redirect("/astelfin_26/dashboard");

  const bandSets = await prisma.pAYEBandSet.findMany({
    orderBy: { effectiveFrom: "desc" },
    include: { bands: { orderBy: { order: "asc" } } },
  });

  const today = new Date();

  // Determine currently active set
  const activeSets = bandSets.filter(
    (s) => new Date(s.effectiveFrom) <= today
  );
  const activeSetId = activeSets[0]?.id ?? null;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/astelfin_26/settings" className="hover:text-brand-gold">Settings</Link>
          <span>›</span>
          <span className="text-gray-600">PAYE Bands</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy">PAYE Band Sets</h1>
        <p className="text-gray-500 text-sm mt-1">
          Each band set records the MRA progressive tax rates in force from a specific date.
          When a payroll run is processed, the system looks up the active set for that period
          and stores a snapshot on each payroll record — so historical calculations remain
          stable even after MRA changes the rates.
        </p>
      </div>

      {/* Seed banner — shown only when no sets exist */}
      {bandSets.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-blue-800 mb-1">No band sets yet</p>
          <p className="text-xs text-blue-700 mb-3">
            Seed the current MRA 2024/25 bands as your starting point. You can add new sets
            whenever MRA publishes updated rates.
          </p>
          <form action={seedCurrentBands}>
            <button
              type="submit"
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Seed 2024/25 MRA bands
            </button>
          </form>
        </div>
      )}

      {/* Existing band sets */}
      {bandSets.length > 0 && (
        <div className="space-y-3">
          {bandSets.map((bs) => {
            const isActive = bs.id === activeSetId;
            return (
              <div
                key={bs.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  isActive ? "border-brand-gold/40" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-brand-navy">{bs.label}</p>
                      {isActive && (
                        <span className="text-[11px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          Currently active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Effective from {new Date(bs.effectiveFrom).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                      {" · "}{bs.bands.length} band{bs.bands.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Band table */}
                <div className="border-t border-gray-50">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="text-left px-5 py-2 font-semibold">From</th>
                        <th className="text-left px-5 py-2 font-semibold">To</th>
                        <th className="text-left px-5 py-2 font-semibold">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bs.bands.map((band) => (
                        <tr key={band.id}>
                          <td className="px-5 py-2 text-gray-700">{fmtAmount(band.fromAmount)}</td>
                          <td className="px-5 py-2 text-gray-700">{fmtAmount(band.toAmount)}</td>
                          <td className="px-5 py-2 font-semibold text-brand-navy">{band.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create new band set */}
      <div>
        <h2 className="text-base font-bold text-brand-navy mb-4">Add new band set</h2>
        <CreateBandSetForm />
      </div>
    </div>
  );
}

// ── Client form component ─────────────────────────────────────────────────────
// Needs to be a separate client component because band rows are dynamic.

import { CreateBandSetForm } from "./CreateBandSetForm";
