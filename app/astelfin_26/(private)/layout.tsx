import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/finance/Sidebar";
import InactivityGuard from "@/components/finance/InactivityGuard";

export const metadata = {
  robots: { index: false, follow: false },
};

// Routes each role is allowed to visit (prefix match)
const STAFF_ALLOWED    = ["/astelfin_26/my"];
const PM_ALLOWED       = ["/astelfin_26/my", "/astelfin_26/projects", "/astelfin_26/deliverables"];

export default async function PrivateFinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  const isStaffOrConsultant = role === "STAFF" || role === "CONSULTANT";
  const isPM = role === "PROJECT_MANAGER";

  // Redirect restricted roles away from pages they cannot access
  if (isStaffOrConsultant) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const allowed = STAFF_ALLOWED.some((p) => pathname.startsWith(p));
    if (!allowed) redirect("/astelfin_26/my");
  }

  if (isPM) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const allowed = PM_ALLOWED.some((p) => pathname.startsWith(p));
    if (!allowed) redirect("/astelfin_26/projects");
  }

  const isLimitedRole = isStaffOrConsultant || isPM;

  // Fetch sidebar badge counts (skip expensive counts for limited roles)
  const now = new Date();
  const [pendingCount, pendingInvoices, pendingLiquidations, overduePayables, overdueReceivables] =
    isLimitedRole
      ? [0, 0, 0, 0, 0]
      : await Promise.all([
          prisma.pendingChange.count({ where: { status: "PENDING" } }),
          prisma.submission.count({
            where: {
              status: {
                in:
                  role === "FINANCE_MANAGER"
                    ? ["PENDING_FM"]
                    : ["PENDING_CEO", "APPROVED"],
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
        pendingApprovals={pendingCount}
        pendingInvoices={pendingInvoices}
        pendingLiquidations={pendingLiquidations}
        overduePayables={overduePayables}
        overdueReceivables={overdueReceivables}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
