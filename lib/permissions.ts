/**
 * Permission system for Astelfin IMS.
 *
 * Design principle: the CEO decides who can do what. Access is driven by
 * CEO-granted permissions (tabs + functions), NOT by a user's role. The only
 * role-based rule is that the CEO always has full access. A small set of
 * critical approvals stays CEO-only (see `isCriticalAction` / CEO checks in
 * server actions) — everything else is grantable to any user.
 *
 * Each User has a `permissions` JSON field. null = fall back to role defaults
 * (which exist only for backward-compatibility with pre-existing accounts).
 */

export interface TabPermissions {
  finance:    boolean;  // Finance & HR section
  operations: boolean;  // Operations section
  projects:   boolean;  // Projects section
  bizdev:     boolean;  // Business Development section
  asil:       boolean;  // ASIL — Implementation Lab
}

export interface FunctionPermissions {
  // Finance & HR
  canAddIncome:           boolean;
  canAddExpense:          boolean;
  canAddDebt:             boolean;
  canManageAssets:        boolean;
  canManageExchangeRates: boolean;
  canViewPayroll:         boolean;  // view Payroll + Tax Dashboard (read-only)
  canProcessPayroll:      boolean;  // run payroll (period locking stays CEO-only)
  canManageBudget:        boolean;
  canManageGrants:        boolean;
  canManageTax:           boolean;  // record/email tax remittances (approval is CEO)
  canManageRecruitment:   boolean;
  canReviewTimesheets:    boolean;
  canManageLeave:         boolean;
  canManageTraining:      boolean;
  canManageTravel:        boolean;
  canManagePerformance:   boolean;
  // Operations
  canCreateInvoice:       boolean;
  canReviewSubmissions:   boolean;  // FM-stage review of payment requests / invoices
  canReviewLiquidations:  boolean;  // FM-stage review of liquidations
  canManageProcurement:   boolean;  // create/manage procurement (approval is CEO)
  canManagePayables:      boolean;
  canManageReceivables:   boolean;
  canManageRecurring:     boolean;
  canManageDocuments:     boolean;
  // Projects
  canAddProject:          boolean;
  // Business Development
  canAddOpportunity:      boolean;
  canSubmitOpportunity:   boolean;
  canRequestOppDeletion:  boolean;  // request deletion of a no-feedback opportunity
  canUpdateBidStatus:     boolean;  // mark as won/rejected
}

export interface EffectivePermissions {
  tabs:      TabPermissions;
  functions: FunctionPermissions;
}

// ── Function key list (single source of truth) ────────────────────────────────

const FUNCTION_KEYS: (keyof FunctionPermissions)[] = [
  "canAddIncome","canAddExpense","canAddDebt","canManageAssets","canManageExchangeRates",
  "canViewPayroll","canProcessPayroll","canManageBudget","canManageGrants","canManageTax",
  "canManageRecruitment","canReviewTimesheets","canManageLeave","canManageTraining",
  "canManageTravel","canManagePerformance",
  "canCreateInvoice","canReviewSubmissions","canReviewLiquidations","canManageProcurement",
  "canManagePayables","canManageReceivables","canManageRecurring","canManageDocuments",
  "canAddProject",
  "canAddOpportunity","canSubmitOpportunity","canRequestOppDeletion","canUpdateBidStatus",
];

function allFunctions(value: boolean): FunctionPermissions {
  return Object.fromEntries(FUNCTION_KEYS.map((k) => [k, value])) as unknown as FunctionPermissions;
}

// ── Role defaults ─────────────────────────────────────────────────────────────
// These are only fallbacks for accounts with no stored permissions. The CEO can
// override any of them per-user via the permission editor.

const FULL_PERMISSIONS: EffectivePermissions = {
  tabs: { finance: true, operations: true, projects: true, bizdev: true, asil: true },
  functions: allFunctions(true),
};

// Finance Manager default = full finance + operations + HR operational access,
// minus the CEO-only critical approvals (which are enforced separately by role).
const FM_DEFAULTS: EffectivePermissions = {
  tabs: { finance: true, operations: true, projects: false, bizdev: false, asil: false },
  functions: {
    ...allFunctions(true),
    canAddProject: false,
    canAddOpportunity: false, canSubmitOpportunity: false,
    canRequestOppDeletion: false, canUpdateBidStatus: false,
  },
};

const PM_DEFAULTS: EffectivePermissions = {
  tabs: { finance: false, operations: false, projects: true, bizdev: false, asil: false },
  functions: {
    ...allFunctions(false),
    canAddProject: true,
    // PMs review their team's timesheets and run performance cycles
    canReviewTimesheets: true,
    canManagePerformance: true,
  },
};

const STAFF_DEFAULTS: EffectivePermissions = {
  tabs: { finance: false, operations: false, projects: false, bizdev: false, asil: false },
  functions: allFunctions(false),
};

function roleDefaults(role: string): EffectivePermissions {
  switch (role) {
    case "CEO":              return FULL_PERMISSIONS;
    case "FINANCE_MANAGER":  return FM_DEFAULTS;
    case "PROJECT_MANAGER":  return PM_DEFAULTS;
    default:                 return STAFF_DEFAULTS;
  }
}

// ── Deep merge ────────────────────────────────────────────────────────────────

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key in override) {
    const val = override[key];
    if (val !== undefined && val !== null) {
      if (typeof val === "object" && !Array.isArray(val)) {
        (result as Record<string, unknown>)[key] = deepMerge(
          (base as Record<string, unknown>)[key] as object,
          val as object
        );
      } else {
        (result as Record<string, unknown>)[key] = val;
      }
    }
  }
  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compute effective permissions for a user.
 * CEO always gets full permissions regardless of stored overrides.
 * Other roles start from role defaults, merged with any custom overrides.
 */
export function getEffectivePermissions(
  role: string,
  storedPermissions: unknown
): EffectivePermissions {
  if (role === "CEO") return FULL_PERMISSIONS;
  const defaults = roleDefaults(role);
  // Start from a full skeleton so any newly-added function keys default to the
  // role default (or false), never undefined.
  const base: EffectivePermissions = {
    tabs:      { ...defaults.tabs },
    functions: { ...allFunctions(false), ...defaults.functions },
  };
  if (!storedPermissions || typeof storedPermissions !== "object") return base;
  return deepMerge(base, storedPermissions as Partial<EffectivePermissions>);
}

/** True if the user is the CEO — the only holder of critical-approval rights. */
export function isCEO(role: string | undefined | null): boolean {
  return role === "CEO";
}

/** Convenience: does this user hold a given function permission? */
export function can(perms: EffectivePermissions, fn: keyof FunctionPermissions): boolean {
  return !!perms.functions[fn];
}

/** Paths accessible for each tab permission. */
export const TAB_PATHS: Record<keyof TabPermissions, string[]> = {
  finance:    [
    "/astelfin_26/dashboard", "/astelfin_26/income", "/astelfin_26/expenses",
    "/astelfin_26/employees",  "/astelfin_26/payroll", "/astelfin_26/consultants",
    "/astelfin_26/debt", "/astelfin_26/assets", "/astelfin_26/reports",
    "/astelfin_26/exchange-rates", "/astelfin_26/budget", "/astelfin_26/grants",
    "/astelfin_26/periods", "/astelfin_26/financial-health", "/astelfin_26/reconciliation",
    "/astelfin_26/performance", "/astelfin_26/timesheets", "/astelfin_26/leave",
    "/astelfin_26/recruitment", "/astelfin_26/training", "/astelfin_26/travel",
    "/astelfin_26/contacts",
  ],
  operations: [
    "/astelfin_26/invoices", "/astelfin_26/liquidations",
    "/astelfin_26/payables", "/astelfin_26/receivables",
    "/astelfin_26/approvals", "/astelfin_26/procurement",
    "/astelfin_26/recurring", "/astelfin_26/compliance", "/astelfin_26/documents",
  ],
  projects:   ["/astelfin_26/projects", "/astelfin_26/deliverables"],
  bizdev:     ["/astelfin_26/bizdev", "/astelfin_26/intel"],
  asil:       ["/astelfin_26/asil"],
};

/** Paths any authenticated user may reach (self-service + landing pages). */
export const MY_PATHS = [
  "/astelfin_26/my",
  "/astelfin_26/overview",
  "/astelfin_26/home",
  "/astelfin_26/change-password",
];

/**
 * Paths unlocked by an individual FUNCTION permission, independent of tab access.
 * Lets the CEO grant read access to a specific area (e.g. payroll & tax) without
 * handing over the entire section.
 */
export const FUNCTION_PATHS: Partial<Record<keyof FunctionPermissions, string[]>> = {
  canViewPayroll:    ["/astelfin_26/payroll", "/astelfin_26/reports/tax"],
  canProcessPayroll: ["/astelfin_26/payroll"],
  canManageTax:      ["/astelfin_26/reports/tax"],
};

/** Check if a given pathname is accessible with these permissions. */
export function canAccessPath(pathname: string, perms: EffectivePermissions): boolean {
  if (MY_PATHS.some((p) => pathname.startsWith(p))) return true;
  // Function-level view grants (finer-grained than tabs)
  for (const [fn, paths] of Object.entries(FUNCTION_PATHS)) {
    if (perms.functions[fn as keyof FunctionPermissions]) {
      if (paths!.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
    }
  }
  for (const [tab, paths] of Object.entries(TAB_PATHS)) {
    if (perms.tabs[tab as keyof TabPermissions]) {
      if (paths.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
    }
  }
  return false;
}

/** Serialise for storage — strips undefined/functions. */
export function serializePermissions(perms: EffectivePermissions): object {
  return JSON.parse(JSON.stringify(perms));
}

/** Human-readable label for each function key. */
export const FUNCTION_LABELS: Record<keyof FunctionPermissions, string> = {
  canAddIncome:           "Add / Edit Income",
  canAddExpense:          "Add / Edit Expenses",
  canAddDebt:             "Manage Debt",
  canManageAssets:        "Manage Assets",
  canManageExchangeRates: "Manage Exchange Rates",
  canViewPayroll:         "View Payroll & Tax Dashboard",
  canProcessPayroll:      "Process Payroll",
  canManageBudget:        "Manage Budget Lines",
  canManageGrants:        "Manage Donor Grants",
  canManageTax:           "Record Tax Remittances",
  canManageRecruitment:   "Manage Recruitment",
  canReviewTimesheets:    "Review Team Timesheets",
  canManageLeave:         "Manage Leave",
  canManageTraining:      "Manage Training / CPD",
  canManageTravel:        "Manage Travel",
  canManagePerformance:   "Manage Performance",
  canCreateInvoice:       "Create Invoices / Requests",
  canReviewSubmissions:   "Review Payment Requests (FM stage)",
  canReviewLiquidations:  "Review Liquidations (FM stage)",
  canManageProcurement:   "Manage Procurement",
  canManagePayables:      "Accounts Payable",
  canManageReceivables:   "Accounts Receivable",
  canManageRecurring:     "Manage Recurring Expenses",
  canManageDocuments:     "Manage Document Library",
  canAddProject:          "Add / Edit Projects",
  canAddOpportunity:      "Add Opportunities",
  canSubmitOpportunity:   "Submit Opportunities",
  canRequestOppDeletion:  "Request Opportunity Deletion",
  canUpdateBidStatus:     "Update Bid Status (Won / Rejected)",
};

/** Which functions belong to which tab (drives the editor grouping). */
export const TAB_FUNCTIONS: Record<keyof TabPermissions, (keyof FunctionPermissions)[]> = {
  finance:    [
    "canAddIncome","canAddExpense","canAddDebt","canManageAssets","canManageExchangeRates",
    "canViewPayroll","canProcessPayroll","canManageBudget","canManageGrants","canManageTax",
    "canManageRecruitment","canReviewTimesheets","canManageLeave","canManageTraining",
    "canManageTravel","canManagePerformance",
  ],
  operations: [
    "canCreateInvoice","canReviewSubmissions","canReviewLiquidations","canManageProcurement",
    "canManagePayables","canManageReceivables","canManageRecurring","canManageDocuments",
  ],
  projects:   ["canAddProject"],
  bizdev:     ["canAddOpportunity","canSubmitOpportunity","canRequestOppDeletion","canUpdateBidStatus"],
  asil:       [],
};
