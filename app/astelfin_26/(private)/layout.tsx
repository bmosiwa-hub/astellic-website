import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/finance/Sidebar";
import InactivityGuard from "@/components/finance/InactivityGuard";
import { getEffectivePermissions, canAccessPath } from "@/lib/permissions";
import { getActiveOrgId } from "@/lib/org";
import { getUserCompanies } from "@/lib/company";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PrivateFinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  // If the user must change their password, gate everything except the change-password page
  // Read pathname once — used for access control and layout switching
  const headersList = await headers();
  const pathname    = headersList.get("x-pathname") ?? "";

  const onChangePassword = pathname.startsWith("/astelfin_26/change-password");

  if (session.user.mustChangePassword) {
    if (!onChangePassword) {
      redirect("/astelfin_26/change-password");
    }
    // User must change password and is on the change-password page.
    // Render a minimal, sidebar-free layout so the form is clearly visible.
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  const role = session.user.role;

  // Fetch the user's stored permissions
  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { permissions: true },
  });

  const perms = getEffectivePermissions(role, dbUser?.permissions ?? null);

  // CEO and FM always have unrestricted access (role defaults cover everything)
  // For other roles: check if current pathname is permitted
  const isCEO = role === "CEO";
  const isFM  = role === "FINANCE_MANAGER";

  if (!isCEO && !isFM) {

    if (!canAccessPath(pathname, perms)) {
      // Redirect to the first accessible area
      if (perms.tabs.finance)    redirect("/astelfin_26/dashboard");
      if (perms.tabs.operations) redirect("/astelfin_26/invoices");
      if (perms.tabs.projects)   redirect("/astelfin_26/projects");
      if (perms.tabs.bizdev)     redirect("/astelfin_26/bizdev");
      redirect("/astelfin_26/my");
    }
  }

  const isLimitedRole = !isCEO && !isFM;

  // Fetch organisations for the switcher + company memberships
  const [orgs, activeOrgId, companies] = await Promise.all([
    prisma.organisation.findMany({
      where:   { active: true },
      orderBy: { name: "asc" },
      select:  { id: true, name: true, shortCode: true },
    }),
    getActiveOrgId(session),
    getUserCompanies(session.user.id!),
  ]);

  // Fetch sidebar badge counts
  const now = new Date();
  const [pendingCount, pendingInvoices, pendingLiquidations, overduePayables, overdueReceivables] =
    isLimitedRole
      ? [0, 0, 0, 0, 0]
      : await Promise.all([
          prisma.pendingChange.count({ where: { status: "PENDING" } }),
          prisma.submission.count({
            where: {
              status: {
                in: isFM ? ["PENDING_FM"] : ["PENDING_CEO", "APPROVED"],
              },
            },
          }),
          prisma.liquidation.count({
            where: { status: { in: ["PENDING_FM", "CHANGES_REQUESTED"] } },
          }),
          prisma.accountPayable.count({
            where: { dueDate: { lt: now }, status: { in: ["UPCOMING", "DUE", "OVERDUE"] } },
          }),
          prisma.accountReceivable.count({
            where: { expectedDate: { lt: now }, status: { in: ["EXPECTED", "PARTIAL"] } },
          }),
        ]);

  return (
    <>
      <InactivityGuard />
      <Sidebar
        userName={session.user.name ?? "User"}
        userRole={role}
        permissions={perms}
        pendingApprovals={pendingCount}
        pendingInvoices={pendingInvoices}
        pendingLiquidations={pendingLiquidations}
        overduePayables={overduePayables}
        overdueReceivables={overdueReceivables}
        orgs={orgs}
        activeOrgId={activeOrgId}
        companies={companies}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
