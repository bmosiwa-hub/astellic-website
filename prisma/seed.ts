import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create CEO user
  const passwordHash = await bcrypt.hash("Astellic@CEO2025!", 12);

  const ceo = await prisma.user.upsert({
    where: { email: "admin@astellic.com" },
    update: {},
    create: {
      name: "Dr. Benjamin Mosiwa",
      email: "admin@astellic.com",
      passwordHash,
      role: "CEO",
    },
  });

  console.log("✅ CEO user created:", ceo.email);

  // Seed default tax configs
  const taxConfigs = [
    { key: "WITHHOLDING_TAX_RESIDENT", value: 0.2, label: "Withholding Tax — Resident Consultant (20%)" },
    { key: "WITHHOLDING_TAX_NONRESIDENT", value: 0.15, label: "Withholding Tax — Non-Resident Consultant (15%)" },
    { key: "NSSF_EMPLOYEE_RATE", value: 0.03, label: "NSSF Employee Contribution Rate (3%)" },
    { key: "NSSF_EMPLOYER_RATE", value: 0.03, label: "NSSF Employer Contribution Rate (3%)" },
  ];

  for (const tc of taxConfigs) {
    await prisma.taxConfig.upsert({
      where: { key: tc.key },
      update: {},
      create: tc,
    });
  }

  console.log("✅ Tax configurations seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
