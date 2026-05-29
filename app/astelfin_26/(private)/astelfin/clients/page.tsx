import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Clients | Astelfin", robots: { index: false, follow: false } };

function clientHref(slug: string) {
  if (slug === "astellic") return "/astelfin_26/dashboard";
  return "/astelfin_26/dashboard";
}

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const clients = await prisma.managedCompany.findMany({
    where: { type: "CLIENT" },
    include: { memberships: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-3xl font-bold text-brand-navy">Managed Clients</h1>
          <p className="text-brand-muted text-sm">
            Companies and organisations supported by Astelfin.
          </p>
        </div>
        <Link
          href="/astelfin_26/astelfin/clients/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          + Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <p className="text-2xl mb-2">🏢</p>
          <p className="font-semibold text-brand-navy">No clients yet</p>
          <Link href="/astelfin_26/astelfin/clients/new" className="mt-3 inline-block bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Add First Client
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const memberCount = client.memberships.length;
            const href = clientHref(client.slug);
            const initials = client.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div key={client.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-6 p-6">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: client.color }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <h2 className="font-bold text-brand-navy text-lg">{client.name}</h2>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        client.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {client.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {client.tagline && (
                      <p className="text-sm text-brand-muted">{client.tagline}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {memberCount} platform member{memberCount !== 1 ? "s" : ""} &middot; Client since{" "}
                      {new Date(client.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={href}
                      className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-navy/90 transition-colors"
                    >
                      Open Room
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
                  <span>Slug: <code className="font-mono text-brand-navy">{client.slug}</code></span>
                  <span>Type: <span className="capitalize font-medium text-brand-navy">{client.type.replace("_", " ").toLowerCase()}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
