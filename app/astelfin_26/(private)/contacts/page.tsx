import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = { title: "Contacts | Astelfin IMS", robots: { index: false, follow: false } };

const TYPE_COLOURS: Record<string, string> = {
  DONOR_OFFICER:        "bg-blue-100 text-blue-800",
  PRIME_CONTRACTOR:     "bg-purple-100 text-purple-800",
  PARTNER_ORG:          "bg-teal-100 text-teal-800",
  GOVERNMENT_OFFICIAL:  "bg-orange-100 text-orange-800",
  CONSULTANT_EXTERNAL:  "bg-yellow-100 text-yellow-800",
  MEDIA:                "bg-pink-100 text-pink-800",
  OTHER:                "bg-gray-100 text-gray-600",
};

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const contacts = await prisma.contact.findMany({
    orderBy: [{ contactType: "asc" }, { name: "asc" }],
    include: { donorGrant: { select: { name: true } } },
  });

  const byType: Record<string, typeof contacts> = {};
  for (const c of contacts) {
    (byType[c.contactType] ??= []).push(c);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/astelfin_26/contacts/new" className="bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
          + New Contact
        </Link>
      </div>

      {contacts.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No contacts yet. Add donors, partners, and key relationships here.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Organisation</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Linked Grant</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Last Contacted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.name}</p>
                  {c.jobTitle && <p className="text-xs text-gray-500">{c.jobTitle}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.organisation ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOURS[c.contactType] ?? ""}`}>
                    {c.contactType.replace("_"," ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{c.email ?? c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.donorGrant?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.lastContactedAt ? formatDate(c.lastContactedAt) : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/astelfin_26/contacts/${c.id}`} className="text-xs text-brand-navy hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
