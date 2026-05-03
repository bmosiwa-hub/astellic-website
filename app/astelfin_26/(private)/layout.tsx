import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/finance/Sidebar";
import InactivityGuard from "@/components/finance/InactivityGuard";

export const metadata = {
  robots: { index: false, follow: false },
};

// Routes that Staff / Consultant are allowed to visit
const MY_ROUTES_PREFIX = "/astelfin_26/my/";
const ALLOWED_STAFF_ROUTES = ["/astelfin_26/my/"];

export default async function PrivateFinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  const isStaffOrConsultant = role === "STAFF" || role === "CONSULTANT";

  // Redirect Staff / Consultant away from management pages
  if (isStaffOrConsultant) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const isAllowed = ALLOWED_STAFF_ROUTES.some((p) => pathname.startsWith(p));
    if (!isAllowed) redirect("/astelfin_26/my/submissions");
  }

  // Fetch sidebar badge counts (skip expensive counts for Staff/Consultant)
  const [pendingCount, pendingInvoices, pendingLiquidations] = isStaffOrConsultant
    ? [0, 0, 0]
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
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
