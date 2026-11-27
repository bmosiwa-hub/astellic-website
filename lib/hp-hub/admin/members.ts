import { prisma } from "@/lib/prisma";

/** Active HP-Hub members as select options (for owners). */
export async function memberOptions() {
  const rows = await prisma.hpMember.findMany({
    where: { active: true, user: { active: true } },
    select: { id: true, user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return rows.map((r) => ({ id: r.id, name: r.user.name }));
}
