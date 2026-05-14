/**
 * Permission system for Astelfin IMS.
 *
 * Each User can have a `permissions` JSON field that overrides the role defaults.
 * null permissions = use role defaults.
 *
 * The CEO always has full access and is never permission-checked.
 */

export interface TabPermissions {
  finance:    boolean;  // Finance & HR section
  operations: boolean;  // Operations section
  projects:   boolean;  // Projects section
  bizdev:     boolean;  // Business Development section
}

export interface FunctionPermissions {
  // Finance tab
  canAddIncome:           boolean;
  canAddExpense:          boolean;
  canAddDebt:             boolean;
  canManageAssets:        boolean;
  canManageExchangeRates: boolean;
  canViewPayroll:         boolean;
  // Operations tab
  canCreateInvoice:       boolean;
  canManageProcurement:   boolean;
  canManagePayables:      boolean;
  canManageReceivables:   boolean;
  // Projects tab
  canAddProject:          boolean;
  // Business Development tab
  canAddOpportunity:      boolean;
  canSubmitOpportunity:   boolean;
  canRequestOppDeletion:  boolean;  // RM Associate: request deletion of no-feedback opp
  canUpdateBidStatus:     boolean;  // Mark as won/rejected
}

export interface EffectivePermissions {
  tabs:      TabPermissions;
  functions: FunctionPermissions;
}

// ── Role defaults ─────────────────────────────────────────────────────────────

const FULL_PERMISSIONS: EffectivePermissions = {
  tabs: { finance: true, operations: true, projects: true, bizdev: true },
  functions: {
    canAddIncome: true, canAddExpense: true, canAddDebt: true,
    canManageAssets: true, canManageExchangeRates: true, canViewPayroll: true,
    canCreateInvoice: true, canManageProcurement: true,
    canManagePayables: true, canManageReceivables: true,
    canAddProject: true,
    canAddOpportunity: true, canSubmitOpportunity: true,
    canRequestOppDeletion: true, canUpdateBidStatus: true,
  },
};

const FM_DEFAULTS: EffectivePermissions = {
  tabs: { finance: true, operations: true, projects: false, bizdev: false },
  functions: {
    canAddIncome: true, canAddExpense: true, canAddDebt: true,
    canManageAssets: true, canManageExchangeRates: false, canViewPayroll: true,
    canCreateInvoice: true, canManageProcurement: true,
    canManagePayables: true, canManageReceivables: true,
    canAddProject: false,
    canAddOpportunity: false, canSubmitOpportunity: false,
    canRequestOppDeletion: false, canUpdateBidStatus: false,
  },
};

const PM_DEFAULTS: EffectivePermissions = {
  tabs: { finance: false, operations: false, projects: true, bizdev: false },
  functions: {
    canAddIncome: false, canAddExpense: false, canAddDebt: false,
    canManageAssets: false, canManageExchangeRates: false, canViewPayroll: false,
    canCreateInvoice: false, canManageProcurement: false,
    canManagePayables: false, canManageReceivables: false,
    canAddProject: true,
    canAddOpportunity: false, canSubmitOpportunity: false,
    canRequestOppDeletion: false, canUpdateBidStatus: false,
  },
};

const STAFF_DEFAULTS: EffectivePermissions = {
  tabs: { finance: false, operations: false, projects: false, bizdev: false },
  functions: {
    canAddIncome: false, canAddExpense: false, canAddDebt: false,
    canManageAssets: false, canManageExchangeRates: false, canViewPayroll: false,
    canCreateInvoice: false, canManageProcurement: false,
    canManagePayables: false, canManageReceivables: false,
    canAddProject: false,
    canAddOpportunity: false, canSubmitOpportunity: false,
    canRequestOppDeletion: false, canUpdateBidStatus: false,
  },
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
  if (!storedPermissions || typeof storedPermissions !== "object") return defaults;
  return deepMerge(defaults, storedPermissions as Partial<EffectivePermissions>);
}

/** Paths accessible for each tab permission. */
export const TAB_PATHS: Record<keyof TabPermissions, string[]> = {
  finance:    [
    "/astelfin_26/dashboard", "/astelfin_26/income", "/astelfin_26/expenses",
    "/astelfin_26/employees",  "/astelfin_26/payroll", "/astelfin_26/consultants",
    "/astelfin_26/debt", "/astelfin_26/assets", "/astelfin_26/reports",
    "/astelfin_26/exchange-rates", "/astelfin_26/budget",
  ],
  operations: [
    "/astelfin_26/invoices", "/astelfin_26/liquidations",
    "/astelfin_26/payables", "/astelfin_26/receivables",
    "/astelfin_26/approvals", "/astelfin_26/procurement",
    "/astelfin_26/recurring", "/astelfin_26/compliance",
  ],
  projects:   ["/astelfin_26/projects", "/astelfin_26/deliverables"],
  bizdev:     ["/astelfin_26/bizdev"],
};

/** All paths (for /my which is always accessible). */
export const MY_PATHS = ["/astelfin_26/my"];

/** Check if a given pathname is accessible with these permissions. */
export function canAccessPath(pathname: string, perms: EffectivePermissions): boolean {
  if (MY_PATHS.some((p) => pathname.startsWith(p))) return true;
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
  canViewPayroll:         "View Payroll",
  canCreateInvoice:       "Create Invoices / Requests",
  canManageProcurement:   "Manage Procurement",
  canManagePayables:      "Accounts Payable",
  canManageReceivables:   "Accounts Receivable",
  canAddProject:          "Add / Edit Projects",
  canAddOpportunity:      "Add Opportunities",
  canSubmitOpportunity:   "Submit Opportunities",
  canRequestOppDeletion:  "Request Opportunity Deletion",
  canUpdateBidStatus:     "Update Bid Status (Won / Rejected)",
};

/** Which functions belong to which tab. */
export const TAB_FUNCTIONS: Record<keyof TabPermissions, (keyof FunctionPermissions)[]> = {
  finance:    ["canAddIncome","canAddExpense","canAddDebt","canManageAssets","canManageExchangeRates","canViewPayroll"],
  operations: ["canCreateInvoice","canManageProcurement","canManagePayables","canManageReceivables"],
  projects:   ["canAddProject"],
  bizdev:     ["canAddOpportunity","canSubmitOpportunity","canRequestOppDeletion","canUpdateBidStatus"],
};
