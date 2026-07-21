import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, role: true, permissions: true },
    orderBy: { role: "asc" },
  });
  for (const u of users) {
    console.log(`\n${u.name} <${u.email}> — role=${u.role}`);
    console.log("  permissions:", JSON.stringify(u.permissions));
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await prisma.$disconnect();
}
