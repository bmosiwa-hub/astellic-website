import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Add Client | Astelfin", robots: { index: false, follow: false } };

async function addClient(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const name    = (formData.get("name") as string).trim();
  const slug    = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-");
  const tagline = (formData.get("tagline") as string).trim() || null;
  const color   = (formData.get("color") as string) || "#1e3a5f";

  await prisma.managedCompany.create({
    data: { name, slug, type: "CLIENT", tagline, color, active: true },
  });

  redirect("/astelfin_26/astelfin/clients");
}

export default async function AddClientPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <Link href="/astelfin_26/astelfin/clients" className="text-sm text-brand-muted hover:text-brand-gold transition-colors">
          Back to Clients
        </Link>
        <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mt-4">Astelfin</p>
        <h1 className="text-2xl font-bold text-brand-navy mt-1">Add Client</h1>
        <p className="text-brand-muted text-sm mt-1">
          Register a new client company supported by Astelfin.
        </p>
      </div>

      <form action={addClient} className="bg-white border border-gray-100 rounded-2xl p-7 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-brand-navy mb-1.5">Company Name <span className="text-rose-500">*</span></label>
          <input
            name="name"
            required
            placeholder="e.g. Astellic Ltd"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-navy mb-1.5">Slug <span className="text-rose-500">*</span></label>
          <input
            name="slug"
            required
            placeholder="e.g. astellic (lowercase, no spaces)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">Used for routing and identification. Must be unique.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-navy mb-1.5">Tagline</label>
          <input
            name="tagline"
            placeholder="e.g. Research, Advisory & Implementation"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-navy mb-1.5">Brand Colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="color"
              defaultValue="#1e3a5f"
              className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer"
            />
            <span className="text-sm text-brand-muted">Used for the company card background</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Add Client
          </button>
        </div>
      </form>
    </div>
  );
}