import { prisma } from "./prisma";
import type { Employee } from "@prisma/client";

export async function getAstelfinOrg() {
  return prisma.organisation.findFirst({
    where: { shortCode: "ASTELFIN", active: true },
  });
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
