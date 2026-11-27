import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminNav, { type NavItem } from "@/components/hp-hub/admin/AdminNav";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { ROLE_LABELS } from "@/lib/hp-hub/constants";
import { can } from "@/lib/hp-hub/permissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "HP-Hub Admin", template: "%s | HP-Hub Admin" },
  robots: { index: false, follow: false },
};

export default async function HpAdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireHpPage();

  // Accounts created with a temporary password must change it first.
  const user = await prisma.user.findUnique({ where: { id: actor.userId }, select: { mustChangePassword: true } });
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (user?.mustChangePassword && pathname !== "/hp-hub/admin/account") redirect("/hp-hub/admin/account?force=1");

  const [pendingReview, newSubmissions, openFeedback, dueFollowUps] = await Promise.all([
    prisma.hpDocument.count({ where: { status: "PENDING_REVIEW" } }),
    can(actor.role, "submission.review") ? prisma.hpSubmission.count({ where: { status: { in: ["NEW", "IN_REVIEW"] } } }) : 0,
    can(actor.role, "feedback.review") ? prisma.hpFeedback.count({ where: { status: "OPEN" } }) : 0,
    prisma.hpAcquisitionItem.count({ where: { nextActionDue: { lte: new Date() }, status: { not: "ACQUIRED" } } }),
  ]);

  const items: NavItem[] = [
    { href: "/hp-hub/admin", label: "Dashboard" },
    { href: "/hp-hub/admin/documents", label: "Documents", badge: pendingReview },
    ...(can(actor.role, "submission.review") ? [{ href: "/hp-hub/admin/submissions", label: "Submissions", badge: newSubmissions }] : []),
    ...(can(actor.role, "feedback.review") ? [{ href: "/hp-hub/admin/feedback", label: "Reports & requests", badge: openFeedback }] : []),
    { href: "/hp-hub/admin/tracker", label: "Missing documents", badge: dueFollowUps },
    ...(can(actor.role, "outreach.manage") ? [{ href: "/hp-hub/admin/outreach", label: "Acquisition requests" }] : []),
    ...(can(actor.role, "import.csv") ? [{ href: "/hp-hub/admin/import", label: "CSV import" }] : []),
    { href: "/hp-hub/admin/analytics", label: "Analytics" },
    ...(can(actor.role, "taxonomy.manage") ? [{ href: "/hp-hub/admin/taxonomy", label: "Taxonomy" }] : []),
    ...(can(actor.role, "members.manage") ? [{ href: "/hp-hub/admin/members", label: "Members & access" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminNav items={items} user={{ name: actor.name, role: ROLE_LABELS[actor.role] }} />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-[1400px]">{children}</main>
    </div>
  );
}
