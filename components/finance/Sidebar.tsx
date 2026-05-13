"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import type { EffectivePermissions } from "@/lib/permissions";

const ROLE_LABELS: Record<string, string> = {
  CEO:             "Chief Executive Officer",
  FINANCE_MANAGER: "Finance Manager",
  PROJECT_MANAGER: "Project Manager",
  STAFF:           "Staff",
  CONSULTANT:      "Consultant",
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icons = {
  dashboard: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
    </svg>
  ),
  income: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  expenses: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  employees: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  payroll: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  consultants: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  debt: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  reports: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  invoices: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  liquidations: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
  payables: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  receivables: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  approvals: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  recurring: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  exchangeRates: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  deliverables: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  myPage: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  submissions: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  assets: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  procurement: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  health: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  tax: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
  performance: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  timesheet: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  bizdev: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  intel: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  chevron: (open: boolean) => (
    <svg
      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  userName: string;
  userRole: string;
  permissions?: EffectivePermissions;
  pendingApprovals?: number;
  pendingInvoices?: number;
  pendingLiquidations?: number;
  overduePayables?: number;
  overdueReceivables?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pathIn(pathname: string, prefixes: string[]) {
  return prefixes.some((p) =>
    pathname === p || (p !== "/astelfin_26/dashboard" && pathname.startsWith(p + "/")) || pathname.startsWith(p)
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar({
  userName,
  userRole,
  permissions,
  pendingApprovals = 0,
  pendingInvoices = 0,
  pendingLiquidations = 0,
  overduePayables = 0,
  overdueReceivables = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const isCEO   = userRole === "CEO";
  const isFM    = userRole === "FINANCE_MANAGER";

  // Show sections based on role OR granted permissions
  const isPM = userRole === "PROJECT_MANAGER";

  const showFinance    = isCEO || isFM || !!(permissions?.tabs.finance);
  const showOperations = isCEO || isFM || !!(permissions?.tabs.operations);
  const showProjects   = isCEO || isPM || !!(permissions?.tabs.projects);
  const showBizDev     = !!(permissions?.tabs.bizdev);
  const showHR         = isCEO || isFM || isPM;

  // ── Determine which section the current path belongs to ──────────────────
  const financePaths   = ["/astelfin_26/dashboard", "/astelfin_26/income", "/astelfin_26/expenses",
                          "/astelfin_26/employees", "/astelfin_26/payroll", "/astelfin_26/consultants",
                          "/astelfin_26/debt", "/astelfin_26/reports", "/astelfin_26/exchange-rates",
                          "/astelfin_26/assets", "/astelfin_26/financial-health"];
  const operationsPaths = ["/astelfin_26/invoices", "/astelfin_26/liquidations", "/astelfin_26/payables",
                           "/astelfin_26/receivables", "/astelfin_26/approvals", "/astelfin_26/recurring",
                           "/astelfin_26/procurement"];
  const projectsPaths   = ["/astelfin_26/projects", "/astelfin_26/deliverables"];
  const hrPaths         = ["/astelfin_26/performance", "/astelfin_26/timesheets"];
  const myPaths         = ["/astelfin_26/my"];

  const bizdevPaths = ["/astelfin_26/bizdev"];
  const intelPaths  = ["/astelfin_26/intel"];

  const [open, setOpen] = useState<Record<string, boolean>>({
    finance:    pathIn(pathname, financePaths),
    operations: pathIn(pathname, operationsPaths),
    projects:   pathIn(pathname, projectsPaths),
    hr:         pathIn(pathname, hrPaths),
    bizdev:     pathIn(pathname, bizdevPaths),
    intel:      pathIn(pathname, intelPaths),
    mypage:     pathIn(pathname, myPaths),
  });

  // Keep sections in sync when navigating
  useEffect(() => {
    setOpen((prev) => ({
      finance:    prev.finance    || pathIn(pathname, financePaths),
      operations: prev.operations || pathIn(pathname, operationsPaths),
      projects:   prev.projects   || pathIn(pathname, projectsPaths),
      hr:         prev.hr         || pathIn(pathname, hrPaths),
      bizdev:     prev.bizdev     || pathIn(pathname, ["/astelfin_26/bizdev"]),
      intel:      prev.intel      || pathIn(pathname, intelPaths),
      mypage:     prev.mypage     || pathIn(pathname, myPaths),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggle(section: string) {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  // ── Link renderer ─────────────────────────────────────────────────────────
  function navLink(href: string, label: string, icon: React.ReactNode, badge?: number) {
    const active =
      pathname === href ||
      (href !== "/astelfin_26/dashboard" && pathname.startsWith(href + "/")) ||
      (href !== "/astelfin_26/dashboard" && pathname === href);

    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-2.5 pl-7 pr-3 py-2 rounded-lg text-sm transition-colors ${
          active
            ? "bg-brand-gold text-white font-semibold"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        {icon}
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-orange-400 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {badge}
          </span>
        )}
      </Link>
    );
  }

  // ── Section header (clickable, toggles open/closed) ───────────────────────
  function sectionHeader(
    key: string,
    label: string,
    icon: React.ReactNode,
    badge?: number
  ) {
    const isOpen = open[key];
    return (
      <button
        onClick={() => toggle(key)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors select-none"
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-orange-400 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 mr-1">
            {badge}
          </span>
        )}
        {Icons.chevron(isOpen)}
      </button>
    );
  }

  const financeIcon = (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const operationsIcon = (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );

  return (
    <aside className="w-60 bg-brand-navy text-white flex flex-col min-h-screen shrink-0">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <p className="font-bold text-lg tracking-tight">Astelfin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">

        {/* ── My Page (all roles) ─────────────────────────── */}
        {sectionHeader("mypage", "My Page", Icons.myPage)}
        {open.mypage && (
          <div className="space-y-0.5 mb-1">
            {navLink("/astelfin_26/my",                "Overview",          Icons.myPage)}
            {navLink("/astelfin_26/my/submissions",    "My Requests",       Icons.submissions)}
            {navLink("/astelfin_26/my/liquidations",   "My Liquidations",   Icons.liquidations)}
            {navLink("/astelfin_26/my/performance",    "My Performance",    Icons.performance)}
            {navLink("/astelfin_26/my/timesheets",     "My Timesheets",     Icons.timesheet)}
          </div>
        )}

        {/* ── Finance (FM + CEO) ──────────────────────────── */}
        {showFinance && (
          <>
            <div className="pt-1" />
            {sectionHeader("finance", "Finance", financeIcon)}
            {open.finance && (
              <div className="space-y-0.5 mb-1">
                {navLink("/astelfin_26/dashboard",   "Dashboard",    Icons.dashboard)}
                {navLink("/astelfin_26/income",      "Income",       Icons.income)}
                {navLink("/astelfin_26/expenses",    "Expenses",     Icons.expenses)}
                {navLink("/astelfin_26/employees",   "Employees",    Icons.employees)}
                {navLink("/astelfin_26/payroll",     "Payroll",      Icons.payroll)}
                {navLink("/astelfin_26/consultants", "Consultants",  Icons.consultants)}
                {navLink("/astelfin_26/debt",        "Debt",         Icons.debt)}
                {navLink("/astelfin_26/assets",      "Assets",       Icons.assets)}
                {navLink("/astelfin_26/reports",          "Reports",         Icons.reports)}
                {(isCEO || isFM) && navLink("/astelfin_26/reports/tax",      "Tax Dashboard",   Icons.tax)}
                {(isCEO || isFM) && navLink("/astelfin_26/financial-health", "Financial Health", Icons.health)}
                {navLink("/astelfin_26/exchange-rates", "Exchange Rates", Icons.exchangeRates)}
              </div>
            )}
          </>
        )}

        {/* ── Operations (FM + CEO + granted) ─────────────── */}
        {showOperations && (
          <>
            <div className="pt-1" />
            {sectionHeader(
              "operations",
              "Operations",
              operationsIcon,
              (pendingInvoices || 0) + (pendingLiquidations || 0)
            )}
            {open.operations && (
              <div className="space-y-0.5 mb-1">
                {navLink("/astelfin_26/invoices",     "Invoices & Requests",  Icons.invoices,     pendingInvoices)}
                {navLink("/astelfin_26/liquidations", "Liquidations",         Icons.liquidations, pendingLiquidations)}
                {navLink("/astelfin_26/payables",     "Accounts Payable",     Icons.payables,     overduePayables)}
                {navLink("/astelfin_26/receivables",  "Accounts Receivable",  Icons.receivables,  overdueReceivables)}
                {navLink("/astelfin_26/approvals",    "Approvals",            Icons.approvals,    isCEO ? pendingApprovals : undefined)}
                {navLink("/astelfin_26/procurement",  "Procurement",          Icons.procurement)}
                {isCEO && navLink("/astelfin_26/recurring", "Recurring Expenses", Icons.recurring)}
              </div>
            )}
          </>
        )}

        {/* ── HR & People (CEO + FM + PM) ─────────────────── */}
        {showHR && (
          <>
            <div className="pt-1" />
            {sectionHeader("hr", "HR & People", Icons.employees)}
            {open.hr && (
              <div className="space-y-0.5 mb-1">
                {navLink("/astelfin_26/performance", "Team Performance", Icons.performance)}
                {navLink("/astelfin_26/timesheets",  "Team Timesheets",  Icons.timesheet)}
              </div>
            )}
          </>
        )}

        {/* ── Business Development (CEO + granted) ────────── */}
        {showBizDev && (
          <>
            <div className="pt-1" />
            {sectionHeader("bizdev", "Business Development", Icons.bizdev)}
            {open.bizdev && (
              <div className="space-y-0.5 mb-1">
                {navLink("/astelfin_26/bizdev",           "Opportunities",       Icons.bizdev)}
                {navLink("/astelfin_26/bizdev/submitted", "Submitted",           Icons.submissions)}
              </div>
            )}
          </>
        )}

        {/* ── Opportunity Intelligence (CEO + bizdev) ──────── */}
        {showBizDev && (
          <>
            <div className="pt-1" />
            {sectionHeader("intel", "Intelligence Engine", Icons.intel)}
            {open.intel && (
              <div className="space-y-0.5 mb-1">
                {navLink("/astelfin_26/intel",         "Discovery Feed",  Icons.intel)}
                {isCEO && navLink("/astelfin_26/intel/sources", "Sources", Icons.settings)}
              </div>
            )}
          </>
        )}

        {/* ── Projects (CEO + PM) ─────────────────────────── */}
        {showProjects && (
          <>
            <div className="pt-1" />
            {sectionHeader("projects", "Projects", Icons.projects)}
            {open.projects && (
              <div className="space-y-0.5 mb-1">
                {navLink("/astelfin_26/projects",     "All Projects",  Icons.projects)}
                {navLink("/astelfin_26/deliverables", "Deliverables",  Icons.deliverables)}
              </div>
            )}
          </>
        )}

        {/* ── Settings (CEO only) ─────────────────────────── */}
        {isCEO && (
          <>
            <div className="pt-2 border-t border-white/10 mt-2" />
            <Link
              href="/astelfin_26/settings"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/astelfin_26/settings")
                  ? "bg-brand-gold text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {Icons.settings}
              <span>Settings</span>
            </Link>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-sm font-semibold text-white truncate">{userName}</p>
        <p className="text-xs text-gray-400">{ROLE_LABELS[userRole] ?? userRole}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/astelfin_26/login" })}
          className="mt-3 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
