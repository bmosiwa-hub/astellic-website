"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const ROLE_LABELS: Record<string, string> = {
  CEO:             "Executive Director",
  FINANCE_MANAGER: "Finance Manager",
  PROJECT_MANAGER: "Project Manager",
  STAFF:           "Staff",
  CONSULTANT:      "Consultant",
};

// ── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
    </svg>
  ),
  income: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  expenses: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  employees: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  payroll: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  consultants: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  debt: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  reports: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  invoices: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  liquidations: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
  payables: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  receivables: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  approvals: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  recurring: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  exchangeRates: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  deliverables: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  mySubmissions: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  myLiquidations: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
};

interface SidebarProps {
  userName: string;
  userRole: string;
  pendingApprovals?: number;
  pendingInvoices?: number;
  pendingLiquidations?: number;
  overduePayables?: number;
  overdueReceivables?: number;
}

export default function Sidebar({
  userName,
  userRole,
  pendingApprovals = 0,
  pendingInvoices = 0,
  pendingLiquidations = 0,
  overduePayables = 0,
  overdueReceivables = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const isCEO = userRole === "CEO";
  const isFM  = userRole === "FINANCE_MANAGER";
  const isPM  = userRole === "PROJECT_MANAGER";
  const isStaff = userRole === "STAFF" || userRole === "CONSULTANT";

  const showFinance  = isCEO || isFM;
  const showProjects = isCEO || isPM;

  function navLink(
    href: string,
    label: string,
    icon: React.ReactNode,
    badge?: number
  ) {
    const active =
      pathname === href ||
      (href !== "/astelfin_26/dashboard" && pathname.startsWith(href));

    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-brand-gold text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        {icon}
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-orange-400 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {badge}
          </span>
        )}
      </Link>
    );
  }

  function sectionLabel(text: string) {
    return (
      <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/30 select-none">
        {text}
      </p>
    );
  }

  return (
    <aside className="w-64 bg-brand-navy text-white flex flex-col min-h-screen shrink-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <p className="font-bold text-lg tracking-tight">Astelfin</p>
        <p className="text-[11px] uppercase tracking-widest text-brand-gold mt-0.5">
          Astellic Financial System
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">

        {/* ── Staff / Consultant portal ────────────────── */}
        {isStaff && (
          <>
            {sectionLabel("My Portal")}
            {navLink("/astelfin_26/my/submissions",  "My Submissions",  Icons.mySubmissions)}
            {navLink("/astelfin_26/my/liquidations", "My Liquidations", Icons.myLiquidations)}
          </>
        )}

        {/* ── Project Manager portal ───────────────────── */}
        {isPM && !isStaff && (
          <>
            {sectionLabel("Projects")}
            {navLink("/astelfin_26/projects",     "Projects",     Icons.projects)}
            {navLink("/astelfin_26/deliverables", "Deliverables", Icons.deliverables)}
            <div className="my-2 border-t border-white/10" />
            {sectionLabel("My Portal")}
            {navLink("/astelfin_26/my/submissions",  "My Submissions",  Icons.mySubmissions)}
            {navLink("/astelfin_26/my/liquidations", "My Liquidations", Icons.myLiquidations)}
          </>
        )}

        {/* ── Finance section (FM + CEO) ───────────────── */}
        {showFinance && (
          <>
            {sectionLabel("Finance")}
            {navLink("/astelfin_26/dashboard",  "Dashboard",  Icons.dashboard)}
            {navLink("/astelfin_26/income",     "Income",     Icons.income)}
            {navLink("/astelfin_26/expenses",   "Expenses",   Icons.expenses)}
            {navLink("/astelfin_26/employees",  "Employees",  Icons.employees)}
            {navLink("/astelfin_26/payroll",    "Payroll",    Icons.payroll)}
            {navLink("/astelfin_26/consultants","Consultants",Icons.consultants)}
            {navLink("/astelfin_26/debt",       "Debt",       Icons.debt)}
            {navLink("/astelfin_26/reports",    "Reports",    Icons.reports)}
            <div className="my-2 border-t border-white/10" />
            {sectionLabel("Operations")}
            {navLink("/astelfin_26/invoices",     "Invoices & Requests",  Icons.invoices,     pendingInvoices)}
            {navLink("/astelfin_26/liquidations", "Liquidations",         Icons.liquidations, pendingLiquidations)}
            {navLink("/astelfin_26/payables",     "Accounts Payable",     Icons.payables,     overduePayables)}
            {navLink("/astelfin_26/receivables",  "Accounts Receivable",  Icons.receivables,  overdueReceivables)}
            {navLink("/astelfin_26/approvals",    "Approvals",            Icons.approvals,    isCEO ? pendingApprovals : undefined)}
            {isCEO && navLink("/astelfin_26/recurring", "Recurring Expenses", Icons.recurring)}
            {navLink("/astelfin_26/exchange-rates", "Exchange Rates", Icons.exchangeRates)}
          </>
        )}

        {/* ── Projects section (CEO + PM handled separately above for pure PM) */}
        {showFinance && showProjects && (
          <>
            <div className="my-2 border-t border-white/10" />
            {sectionLabel("Projects")}
            {navLink("/astelfin_26/projects",     "Projects",     Icons.projects)}
            {navLink("/astelfin_26/deliverables", "Deliverables", Icons.deliverables)}
          </>
        )}

        {/* Settings — CEO only */}
        {isCEO && (
          <>
            <div className="my-2 border-t border-white/10" />
            {navLink("/astelfin_26/settings", "Settings", Icons.settings)}
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
