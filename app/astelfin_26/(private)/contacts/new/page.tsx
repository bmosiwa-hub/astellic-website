import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = { title: "New Contact | Astelfin IMS", robots: { index: false, follow: false } };

async function createContact(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const lastContactedAt = formData.get("lastContactedAt") as string;
  const grantId = (formData.get("donorGrantId") as string) || null;

  await prisma.contact.create({
    data: {
      name:            formData.get("name") as string,
      organisation:    (formData.get("organisation") as string) || null,
      jobTitle:        (formData.get("jobTitle") as string) || null,
      contactType:     formData.get("contactType") as "DONOR_OFFICER",
      email:           (formData.get("email") as string) || null,
      phone:           (formData.get("phone") as string) || null,
      linkedInUrl:     (formData.get("linkedInUrl") as string) || null,
      country:         (formData.get("country") as string) || null,
      notes:           (formData.get("notes") as string) || null,
      donorGrantId:    grantId,
      lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : null,
      createdById:     session.user.id,
    },
  });
  revalidatePath("/astelfin_26/contacts");
  redirect("/astelfin_26/contacts");
}

export default async function NewContactPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const grants = await prisma.donorGrant.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-2xl">
      <a href="/astelfin_26/contacts" className="text-sm text-gray-500 hover:text-gray-700">← Contacts</a>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">New Contact</h1>
      <form action={createContact} className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input type="text" name="name" required className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
          <input type="text" name="organisation" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input type="text" name="jobTitle" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type *</label>
          <select name="contactType" required className="w-full border rounded-lg px-3 py-2 text-sm">
            {["DONOR_OFFICER","PRIME_CONTRACTOR","PARTNER_ORG","GOVERNMENT_OFFICIAL","CONSULTANT_EXTERNAL","MEDIA","OTHER"].map(t => (
              <option key={t} value={t}>{t.replace(/_/g," ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" name="phone" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input type="text" name="country" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input type="url" name="linkedInUrl" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Linked Grant</label>
          <select name="donorGrantId" className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">— none —</option>
            {grants.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Contacted</label>
          <input type="date" name="lastContactedAt" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2 flex gap-3">
          <button type="submit" className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm hover:opacity-90">Save Contact</button>
          <a href="/astelfin_26/contacts" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </div>
  );
}
