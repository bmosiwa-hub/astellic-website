import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";

/** Which entity groups the current user is allowed to search. */
export interface SearchAccess {
  finance:    boolean; // Income, Expense, Asset, Donor Grant
  hr:         boolean; // Employee, Consultant, Contact
  operations: boolean; // Submission, Payable, Receivable, Procurement
  projects:   boolean; // Project
  payrollTax: boolean; // Payroll, Tax Remittance
}

export interface SearchHit {
  id:    string;
  type:  string;   // group key (drives icon + heading)
  label: string;   // primary line
  sub:   string;   // secondary line
  href:  string;   // where clicking goes
}

export interface SearchGroup {
  key:   string;
  title: string;
  hits:  SearchHit[];
}

const PER_TYPE = 6;

/** Case-insensitive "contains" filter for one field. */
const like = (field: string, q: string) => ({ [field]: { contains: q, mode: "insensitive" as const } });

/**
 * Cross-entity search over the Astelfin data the user is permitted to see.
 * Each entity group is only queried when the caller passes the matching access
 * flag, so results never leak past a user's granted tabs.
 */
export async function globalSearch(qRaw: string, access: SearchAccess): Promise<{ groups: SearchGroup[]; total: number }> {
  const q = qRaw.trim();
  if (q.length < 2) return { groups: [], total: 0 };

  const groups: SearchGroup[] = [];
  const push = (key: string, title: string, hits: SearchHit[]) => {
    if (hits.length) groups.push({ key, title, hits });
  };

  // Run every permitted query in parallel.
  const [
    employees, consultants, contacts,
    income, expenses, assets, grants,
    submissions, payables, receivables, procurement,
    projects,
    payroll, remittances,
  ] = await Promise.all([
    // ── HR & People ──
    access.hr ? prisma.employee.findMany({
      where: { active: true, OR: [like("name", q), like("position", q), like("email", q)] },
      take: PER_TYPE, orderBy: { name: "asc" }, select: { id: true, name: true, position: true },
    }) : [],
    access.hr ? prisma.consultant.findMany({
      where: { deletedAt: null, OR: [like("name", q), like("email", q), like("notes", q)] },
      take: PER_TYPE, orderBy: { name: "asc" }, select: { id: true, name: true, email: true },
    }) : [],
    access.hr ? prisma.contact.findMany({
      where: { OR: [like("name", q), like("organisation", q), like("email", q), like("notes", q)] },
      take: PER_TYPE, orderBy: { name: "asc" }, select: { id: true, name: true, organisation: true, email: true },
    }) : [],
    // ── Finance ──
    access.finance ? prisma.income.findMany({
      where: { deletedAt: null, OR: [like("description", q), like("source", q), like("notes", q)] },
      take: PER_TYPE, orderBy: { createdAt: "desc" }, select: { id: true, description: true, amount: true, currency: true, source: true },
    }) : [],
    access.finance ? prisma.expense.findMany({
      where: { deletedAt: null, OR: [like("description", q), like("vendor", q), like("category", q), like("notes", q)] },
      take: PER_TYPE, orderBy: { paidDate: "desc" }, select: { id: true, description: true, amount: true, currency: true, category: true },
    }) : [],
    access.finance ? prisma.asset.findMany({
      where: { deletedAt: null, OR: [like("name", q), like("description", q), like("category", q), like("notes", q)] },
      take: PER_TYPE, orderBy: { createdAt: "desc" }, select: { id: true, name: true, category: true },
    }) : [],
    access.finance ? prisma.donorGrant.findMany({
      where: { OR: [like("name", q), like("notes", q)] },
      take: PER_TYPE, orderBy: { createdAt: "desc" }, select: { id: true, name: true, status: true },
    }) : [],
    // ── Operations ──
    access.operations ? prisma.submission.findMany({
      where: { deletedAt: null, OR: [like("purpose", q), like("milestone", q), like("notes", q), like("budgetLine", q)] },
      take: PER_TYPE, orderBy: { createdAt: "desc" },
      select: { id: true, purpose: true, milestone: true, type: true, status: true, totalAmount: true, currency: true, submitter: { select: { name: true } } },
    }) : [],
    access.operations ? prisma.accountPayable.findMany({
      where: { deletedAt: null, OR: [like("description", q), like("vendor", q), like("note", q), like("budgetLine", q)] },
      take: PER_TYPE, orderBy: { dueDate: "desc" }, select: { id: true, description: true, vendor: true, amount: true, currency: true, status: true },
    }) : [],
    access.operations ? prisma.accountReceivable.findMany({
      where: { deletedAt: null, OR: [like("description", q), like("payer", q), like("note", q)] },
      take: PER_TYPE, orderBy: { expectedDate: "desc" }, select: { id: true, description: true, payer: true, amount: true, currency: true, status: true },
    }) : [],
    access.operations ? prisma.procurement.findMany({
      where: { deletedAt: null, OR: [like("title", q), like("description", q), like("category", q)] },
      take: PER_TYPE, orderBy: { createdAt: "desc" }, select: { id: true, title: true, category: true, status: true },
    }) : [],
    // ── Projects ──
    access.projects ? prisma.project.findMany({
      where: { OR: [like("name", q), like("description", q)] },
      take: PER_TYPE, orderBy: { createdAt: "desc" }, select: { id: true, name: true, status: true },
    }) : [],
    // ── Payroll & Tax ──
    access.payrollTax ? prisma.payroll.findMany({
      where: { deletedAt: null, OR: [like("period", q), { employee: like("name", q) }] },
      take: PER_TYPE, orderBy: { period: "desc" },
      select: { id: true, period: true, netPay: true, currency: true, status: true, employee: { select: { name: true } } },
    }) : [],
    access.payrollTax ? prisma.taxRemittance.findMany({
      where: { deletedAt: null, OR: [like("taxType", q), like("period", q), like("fmNote", q), like("ceoNote", q)] },
      take: PER_TYPE, orderBy: { createdAt: "desc" }, select: { id: true, taxType: true, period: true, amount: true, status: true },
    }) : [],
  ]);

  const money = (a: number, c?: string) => formatCurrency(a, c ?? "MWK");

  push("employee", "Employees", employees.map((e) => ({
    id: e.id, type: "employee", label: e.name, sub: e.position, href: `/astelfin_26/employees/${e.id}`,
  })));
  push("consultant", "Consultants", consultants.map((c) => ({
    id: c.id, type: "consultant", label: c.name, sub: c.email ?? "Consultant", href: `/astelfin_26/consultants/${c.id}`,
  })));
  push("contact", "Contacts", contacts.map((c) => ({
    id: c.id, type: "contact", label: c.name, sub: c.organisation ?? c.email ?? "Contact", href: `/astelfin_26/contacts/${c.id}`,
  })));
  push("income", "Income", income.map((i) => ({
    id: i.id, type: "income", label: i.description, sub: [i.source, money(i.amount, i.currency)].filter(Boolean).join(" · "), href: `/astelfin_26/income/${i.id}`,
  })));
  push("expense", "Expenses", expenses.map((e) => ({
    id: e.id, type: "expense", label: e.description, sub: `${e.category} · ${money(e.amount, e.currency)}`, href: `/astelfin_26/expenses/${e.id}`,
  })));
  push("asset", "Assets", assets.map((a) => ({
    id: a.id, type: "asset", label: a.name, sub: a.category, href: `/astelfin_26/assets/${a.id}`,
  })));
  push("grant", "Donor Grants", grants.map((g) => ({
    id: g.id, type: "grant", label: g.name, sub: g.status, href: `/astelfin_26/grants/${g.id}`,
  })));
  push("submission", "Invoices & Requests", submissions.map((s) => ({
    id: s.id, type: "submission",
    label: s.purpose ?? s.milestone ?? `${s.type} submission`,
    sub: `${s.type} · ${s.submitter?.name ?? ""} · ${money(s.totalAmount, s.currency)} · ${s.status.replace(/_/g, " ")}`,
    href: `/astelfin_26/invoices/${s.id}`,
  })));
  push("payable", "Accounts Payable", payables.map((p) => ({
    id: p.id, type: "payable", label: p.description,
    sub: [p.vendor, money(p.amount, p.currency), p.status].filter(Boolean).join(" · "), href: `/astelfin_26/payables`,
  })));
  push("receivable", "Accounts Receivable", receivables.map((r) => ({
    id: r.id, type: "receivable", label: r.description,
    sub: [r.payer, money(r.amount, r.currency), r.status].filter(Boolean).join(" · "), href: `/astelfin_26/receivables`,
  })));
  push("procurement", "Procurement", procurement.map((p) => ({
    id: p.id, type: "procurement", label: p.title, sub: [p.category, p.status].filter(Boolean).join(" · "), href: `/astelfin_26/procurement/${p.id}`,
  })));
  push("project", "Projects", projects.map((p) => ({
    id: p.id, type: "project", label: p.name, sub: p.status, href: `/astelfin_26/projects/${p.id}`,
  })));
  push("payroll", "Payroll", payroll.map((p) => ({
    id: p.id, type: "payroll", label: `${p.employee?.name ?? "Payroll"} — ${p.period}`,
    sub: `${money(p.netPay, p.currency)} · ${p.status}`, href: `/astelfin_26/payroll/${p.id}`,
  })));
  push("remittance", "Tax Remittances", remittances.map((t) => ({
    id: t.id, type: "remittance", label: `${t.taxType} — ${t.period}`,
    sub: `${money(t.amount)} · ${t.status.replace(/_/g, " ")}`, href: `/astelfin_26/reports/tax/remittances/${t.id}`,
  })));

  const total = groups.reduce((s, g) => s + g.hits.length, 0);
  return { groups, total };
}
