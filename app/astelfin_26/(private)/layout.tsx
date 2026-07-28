import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/finance/Sidebar";
import InactivityGuard from "@/components/finance/InactivityGuard";
import EnvBanner from "@/components/finance/EnvBanner";
import { getEffectivePermissions, canAccessPath } from "@/lib/permissions";
import { getActiveOrgId } from "@/lib/org";

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

  // Fetch the user's stored permissions + active flag
  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { permissions: true, active: true },
  });

  // Sessions are JWTs, so deactivating a user doesn't kill their token —
  // enforce it here so a deactivated account loses access immediately.
  if (!dbUser || !dbUser.active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md text-center space-y-3">
          <p className="text-lg font-bold text-brand-navy">Account Deactivated</p>
          <p className="text-sm text-gray-500">
            Your account is no longer active. Contact the administrator if you believe this is a mistake.
          </p>
          <a href="/astelfin_26/login" className="inline-block text-sm font-semibold text-brand-gold hover:underline">
            Return to login
          </a>
        </div>
      </div>
    );
  }

  const perms = getEffectivePermissions(role, dbUser?.permissions ?? null);

  // Access is permission-driven: the CEO always has full access; everyone else
  // (including the Finance Manager, whose defaults grant the finance/operations
  // sections) is gated by their CEO-granted permissions.
  const isCEO = role === "CEO";

  if (!isCEO) {
    if (!canAccessPath(pathname, perms)) {
      // Redirect to the first accessible area
      if (perms.tabs.finance)         redirect("/astelfin_26/dashboard");
      if (perms.functions.canViewPayroll) redirect("/astelfin_26/payroll");
      if (perms.tabs.operations)      redirect("/astelfin_26/invoices");
      if (perms.tabs.projects)        redirect("/astelfin_26/projects");
      if (perms.tabs.bizdev)          redirect("/astelfin_26/bizdev");
      redirect("/astelfin_26/my");
    }
  }

  // Operational badge counts are shown to users who can act on those queues.
  const showOpsBadges = isCEO || perms.tabs.operations || perms.tabs.finance;

  // Fetch organisations for the switcher
  const [orgs, activeOrgId] = await Promise.all([
    prisma.organisation.findMany({
      where:   { active: true },
      orderBy: { name: "asc" },
      select:  { id: true, name: true, shortCode: true },
    }),
    getActiveOrgId(session),
  ]);

  // Fetch sidebar badge counts
  const now = new Date();
  const [pendingCount, pendingInvoices, pendingLiquidations, overduePayables, overdueReceivables] =
    !showOpsBadges
      ? [0, 0, 0, 0, 0]
      : await Promise.all([
          prisma.pendingChange.count({ where: { status: "PENDING" } }),
          prisma.submission.count({
            where: {
              status: {
                in: isCEO ? ["PENDING_CEO", "APPROVED"] : ["PENDING_FM"],
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

  // Payroll periods awaiting CEO approval (have records but aren't locked yet).
  // Only the CEO can approve/lock, so the badge is shown to the CEO.
  let pendingPayroll = 0;
  if (isCEO) {
    const unlockedPeriods = await prisma.payroll.findMany({
      where:    { lockedAt: null, deletedAt: null },
      distinct: ["period"],
      select:   { period: true },
    });
    pendingPayroll = unlockedPeriods.length;
  }

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
        pendingPayroll={pendingPayroll}
        overduePayables={overduePayables}
        overdueReceivables={overdueReceivables}
        orgs={orgs}
        activeOrgId={activeOrgId}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <EnvBanner />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
