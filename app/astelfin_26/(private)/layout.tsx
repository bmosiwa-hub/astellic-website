import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/finance/Sidebar";
import InactivityGuard from "@/components/finance/InactivityGuard";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PrivateFinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, pendingCount] = await Promise.all([
    auth(),
    prisma.pendingChange.count({ where: { status: "PENDING" } }),
  ]);
  if (!session?.user) redirect("/astelfin_26/login");

  return (
    <>
      <InactivityGuard />
      <Sidebar
        userName={session.user.name ?? "User"}
        userRole={session.user.role}
        pendingApprovals={pendingCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
