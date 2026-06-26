import { prisma } from "./prisma";
import type { Employee } from "@prisma/client";

export async function getAstelfinOrg() {
  return prisma.organisation.findFirst({
    where: { shortCode: "ASTELFIN", active: true },
  });
}

/**
 * Prisma where-fragment that excludes Astelfin employees from Astellic-facing
 * queries (payroll, tax dashboard, employee lists, etc.) — Astelfin staff are
 * managed in their own room and must never be paid, taxed, or reported on as
 * Astellic employees.
 *
 * Uses an explicit OR with { organisationId: null } because SQL's
 * NOT (col = value) returns NULL (falsy) when col IS NULL, which would
 * accidentally hide legacy Astellic employees that have no organisationId set.
 */
export async function excludeAstelfinWhere(): Promise<Record<string, unknown>> {
  const astelfinOrg = await getAstelfinOrg();
  if (!astelfinOrg) return {};
  return {
    OR: [
      { organisationId: null },
      { organisationId: { not: astelfinOrg.id } },
    ],
  };
}

export type StaffTier = { directors: Employee[]; managers: Employee[]; officers: Employee[] };

export function groupByTier(staff: Employee[]): StaffTier {
  return {
    directors: staff.filter((e) => e.level === "Executive"),
    managers:  staff.filter((e) => ["Senior Manager", "Manager"].includes(e.level ?? "")),
    officers:  staff.filter((e) => !["Executive", "Senior Manager", "Manager"].includes(e.level ?? "")),
  };
}

export async function getDeptStaff(orgId: string, aliases: string[]): Promise<Employee[]> {
  return prisma.employee.findMany({
    where: {
      organisationId: orgId,
      active: true,
      departments: { hasSome: aliases },
    },
    orderBy: [{ name: "asc" }],
  });
}
