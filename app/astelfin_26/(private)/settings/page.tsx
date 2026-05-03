import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import Link from "next/link";

export const metadata = {
  title: "Settings | Astellic Finance",
  robots: { index: false, follow: false },
};

async function createUser(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as "CEO" | "FINANCE_MANAGER") || "FINANCE_MANAGER";

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role } });

  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "User",
    entityId: user.id,
    detail: `${name} (${role})`,
  });

  redirect("/astelfin_26/settings");
}

async function deactivateUser(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const userId = formData.get("userId") as string;
  if (userId === session.user.id) return; // can't deactivate yourself

  await prisma.user.update({ where: { id: userId }, data: { active: false } });
  await auditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "User",
    entityId: userId,
    detail: "Deactivated",
  });

  redirect("/astelfin_26/settings");
}

export default async function SettingsPage() {
  const session = await auth();
  const isCEO = session?.user?.role === "CEO";

  const users = isCEO
    ? await prisma.user.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Settings</h1>
        <Link
          href="/astelfin_26/settings/audit"
          className="text-sm text-brand-gold hover:underline font-semibold"
        >
          View Audit Log →
        </Link>
      </div>

      {/* User management — CEO only */}
      {isCEO ? (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-brand-navy">User Accounts</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-brand-navy">{u.name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3 text-gray-500">{u.role}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.active && u.id !== session?.user?.id && (
                        <form action={deactivateUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button
                            type="submit"
                            className="text-xs text-red-500 hover:underline"
                          >
                            Deactivate
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add user form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-brand-navy mb-5">Add New User</h2>
            <form action={createUser} className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select
                  name="role"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="CEO">CEO</option>
                </select>
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <p>User management is available to the CEO only.</p>
        </div>
      )}
    </div>
  );
}
