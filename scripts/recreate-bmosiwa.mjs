/**
 * Recreates bmosiwa@astellic.com as a CEO account.
 * Run: node scripts/recreate-bmosiwa.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read DATABASE_URL from .env manually
const envPath = resolve(__dirname, "../.env");
const envText = readFileSync(envPath, "utf8");
const match   = envText.match(/^DATABASE_URL="?([^"\n]+)"?/m);
if (!match) { console.error("DATABASE_URL not found in .env"); process.exit(1); }
const DATABASE_URL = match[1];

const { PrismaPg }    = await import("@prisma/adapter-pg");
const { PrismaClient} = await import("@prisma/client");

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const EMAIL    = "bmosiwa@astellic.com";
const PASSWORD = "Astelfin@2026";

try {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`User ${EMAIL} already exists (id: ${existing.id}). No action taken.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const user = await prisma.user.create({
    data: {
      name:         "B. Mosiwa",
      email:        EMAIL,
      passwordHash,
      role:         "CEO",
      active:       true,
    },
  });

  console.log(`✅  Created ${EMAIL} (id: ${user.id}) with role CEO`);
  console.log(`    Temporary password: ${PASSWORD}`);
  console.log(`    Please ask the user to change their password on first login.`);
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
