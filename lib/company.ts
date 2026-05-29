import { prisma } from "./prisma";

export interface CompanyItem {
  id:      string;
  name:    string;
  slug:    string;
  type:    string;
  tagline: string | null;
  color:   string;
  role:    string;
}

export async function getUserCompanies(userId: string): Promise<CompanyItem[]> {
  try {
    const memberships = await prisma.companyMembership.findMany({
      where:   { userId, company: { active: true } },
      include: { company: true },
      orderBy: { company: { name: "asc" } },
    });
    return memberships.map((m) => ({
      id:      m.company.id,
      name:    m.company.name,
      slug:    m.company.slug,
      type:    m.company.type,
      tagline: m.company.tagline,
      color:   m.company.color,
      role:    m.role,
    }));
  } catch {
    // Tables may not exist yet in the database — return empty so the app stays up
    return [];
  }
}
