/**
 * HP-Hub reference data seed. Safe to run repeatedly (idempotent upserts).
 *
 *   npm run hp-hub:seed                         countries, themes, types, tracker, template
 *   npm run hp-hub:seed -- --grant you@x.com    also make that existing user a Super Admin
 *   npm run hp-hub:seed -- --synthetic          also add clearly-marked SYNTHETIC test documents
 *                                               (refused when VERCEL_ENV=production)
 *
 * It never creates real documents, publishers, statistics or downloads.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SEED_COUNTRIES, SEED_DOCUMENT_TYPES, SEED_THEMES } from "../lib/hp-hub/constants";
import { slugify } from "../lib/hp-hub/text";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const MALAWI_TRACKER = [
  { title: "Malawi National Health Financing Strategy", status: "ACQUIRED" },
  { title: "National HIV Strategic Plan", status: "ACQUIRED" },
  { title: "HIV Prevention Framework", status: "MISSING" },
  { title: "National AIDS Spending Assessment", status: "MISSING" },
  { title: "Health Sector Review", status: "NEEDS_VERIFICATION" },
  { title: "National Digital Health Strategy", status: "ACQUIRED" },
] as const;

const DEFAULT_TEMPLATE = {
  name: "Standard document request",
  subject: "Request for a copy of {{title}}",
  body: `Dear {{recipient}},

Astellic maintains the Health Policy Intelligence Hub (HP-Hub), a public repository that helps researchers, policymakers and development partners find health policy documents and grey literature.

We are seeking a copy of "{{title}}" ({{publisher}}, {{year}}) for the repository. If you are able to share it, could you also let us know whether we may host the file publicly, or whether we should link to an official source instead? We record the rights holder and any conditions you set, and will only publish in line with your permission.

Thank you for your help.

Kind regards,
{{sender}}
Astellic`,
};

async function seedReferenceData() {
  for (const c of SEED_COUNTRIES) {
    await prisma.hpCountry.upsert({
      where: { slug: c.slug },
      // Never flip an existing country's live status or overwrite edited intros.
      update: { name: c.name, isoCode: c.isoCode },
      create: { ...c },
    });
  }
  for (const [i, name] of SEED_THEMES.entries()) {
    await prisma.hpTheme.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), sortOrder: i + 1 },
    });
  }
  for (const [i, name] of SEED_DOCUMENT_TYPES.entries()) {
    await prisma.hpDocumentType.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), sortOrder: i + 1 },
    });
  }
  await prisma.hpRequestTemplate.upsert({ where: { name: DEFAULT_TEMPLATE.name }, update: {}, create: DEFAULT_TEMPLATE });

  const malawi = await prisma.hpCountry.findUniqueOrThrow({ where: { slug: "malawi" } });
  for (const t of MALAWI_TRACKER) {
    const exists = await prisma.hpAcquisitionItem.findFirst({ where: { title: t.title, countryId: malawi.id } });
    if (!exists) {
      await prisma.hpAcquisitionItem.create({ data: { title: t.title, countryId: malawi.id, status: t.status } });
    }
  }
  console.log(
    `Seeded ${SEED_COUNTRIES.length} countries, ${SEED_THEMES.length} themes, ${SEED_DOCUMENT_TYPES.length} document types, ${MALAWI_TRACKER.length} tracker records.`,
  );
}

async function grantSuperAdmin(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new Error(`No user with email ${email}. Create the account first.`);
  await prisma.hpMember.upsert({
    where: { userId: user.id },
    update: { role: "SUPER_ADMIN", active: true },
    create: { userId: user.id, role: "SUPER_ADMIN" },
  });
  console.log(`${user.email} is now an HP-Hub Super Admin.`);
}

async function seedSynthetic() {
  if (process.env.VERCEL_ENV === "production") throw new Error("Refusing to create synthetic records in production.");
  const malawi = await prisma.hpCountry.findUniqueOrThrow({ where: { slug: "malawi" } });
  const types = await prisma.hpDocumentType.findMany();
  const themes = await prisma.hpTheme.findMany();
  const publisher = await prisma.hpPublisher.upsert({
    where: { slug: "synthetic-test-publisher" },
    update: {},
    create: { name: "SYNTHETIC Test Publisher", slug: "synthetic-test-publisher", acronym: "TEST", countryId: malawi.id },
  });
  const pick = (slug: string) => types.find((t) => t.slug === slug)!.id;
  const theme = (slug: string) => themes.find((t) => t.slug === slug)!.id;
  const samples = [
    { title: "SYNTHETIC Malaria Strategic Plan (test record)", type: "strategic-plan", themes: ["malaria", "primary-health-care"], year: 2023, access: "EXTERNAL" as const },
    { title: "SYNTHETIC Health Financing Strategy (test record)", type: "strategy", themes: ["health-financing", "health-governance"], year: 2021, access: "EXTERNAL" as const },
    { title: "SYNTHETIC Digital Health Guidelines (test record)", type: "guidelines", themes: ["digital-health", "health-information-systems"], year: 2024, access: "RESTRICTED" as const },
    { title: "SYNTHETIC Immunization Programme Evaluation (test record)", type: "evaluation", themes: ["immunization", "child-health"], year: 2019, access: "EXTERNAL" as const },
  ];
  for (const s of samples) {
    const slug = slugify(`${s.title} ${s.year}`);
    const doc = await prisma.hpDocument.upsert({
      where: { slug },
      update: {},
      create: {
        title: s.title,
        slug,
        countryId: malawi.id,
        documentTypeId: pick(s.type),
        publisherId: publisher.id,
        publicationYear: s.year,
        description: "Synthetic development record created to test HP-Hub search, filters and layouts. It is not a real document and never appears on the production site.",
        sourceUrl: "https://example.org/synthetic-test-record",
        accessType: s.access,
        permissionStatus: "NOT_REQUIRED",
        status: "PUBLISHED",
        publishedAt: new Date(),
        isSynthetic: true,
        themes: { create: s.themes.map((t) => ({ themeId: theme(t) })) },
      },
    });
    await prisma.$executeRaw`SELECT hp_document_refresh_search(${doc.id})`;
  }
  console.log(`Seeded ${samples.length} SYNTHETIC test documents (hidden unless HP_HUB_SHOW_SYNTHETIC=true outside production).`);
}

async function main() {
  const args = process.argv.slice(2);
  await seedReferenceData();
  const gi = args.indexOf("--grant");
  if (gi >= 0 && args[gi + 1]) await grantSuperAdmin(args[gi + 1]);
  if (args.includes("--synthetic")) await seedSynthetic();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
