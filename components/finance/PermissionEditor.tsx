"use client";

import { useTransition, useState } from "react";
import type { EffectivePermissions, TabPermissions, FunctionPermissions } from "@/lib/permissions";
import { FUNCTION_LABELS, TAB_FUNCTIONS } from "@/lib/permissions";

const TAB_LABELS: Record<keyof TabPermissions, string> = {
  finance:    "Finance & HR",
  operations: "Operations",
  projects:   "Projects",
  bizdev:     "Business Development",
  asil:       "ASIL — Implementation Lab",
};

interface Props {
  userId:    string;
  userName:  string;
  current:   EffectivePermissions;
  saveAction: (formData: FormData) => Promise<void>;
}

export default function PermissionEditor({ userId, userName, current, saveAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [tabs, setTabs]   = useState<TabPermissions>({ ...current.tabs });
  const [funcs, setFuncs] = useState<FunctionPermissions>({ ...current.functions });
  const [saved, setSaved] = useState(false);

  function toggleTab(key: keyof TabPermissions) {
    setTabs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // If tab is disabled, disable all its functions too
      if (!next[key]) {
        const tabFuncs = TAB_FUNCTIONS[key];
        setFuncs((pf) => {
          const nf = { ...pf };
          tabFuncs.forEach((f) => { nf[f] = false; });
          return nf;
        });
      }
      return next;
    });
    setSaved(false);
  }

  function toggleFunc(key: keyof FunctionPermissions) {
    setFuncs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function handleSave() {
    const fd = new FormData();
    fd.set("userId",      userId);
    fd.set("permissions", JSON.stringify({ tabs, functions: funcs }));
    startTransition(async () => {
      await saveAction(fd);
      setSaved(true);
    });
  }

  const tabEntries = Object.entries(TAB_LABELS) as [keyof TabPermissions, string][];
  const funcEntries = Object.entries(FUNCTION_LABELS) as [keyof FunctionPermissions, string][];

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Configure which sections and functions <span className="font-semibold text-brand-navy">{userName}</span> can access.
        Changes take effect on their next login or page refresh.
      </p>

      {/* Tab access */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tab Access</p>
        <div className="grid grid-cols-2 gap-2">
          {tabEntries.map(([key, label]) => (
            <label key={key}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                tabs[key] ? "bg-brand-gold/10 border-brand-gold/40" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}>
              <input
                type="checkbox"
                checked={tabs[key]}
                onChange={() => toggleTab(key)}
                className="accent-brand-gold w-4 h-4"
              />
              <span className={`text-sm font-medium ${tabs[key] ? "text-brand-navy" : "text-gray-500"}`}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Function permissions per tab */}
      {tabEntries.map(([tabKey, tabLabel]) => {
        const tabFuncs = TAB_FUNCTIONS[tabKey];
        if (!tabs[tabKey]) return null;
        return (
          <div key={tabKey} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{tabLabel} — Functions</p>
            <div className="grid grid-cols-2 gap-1.5">
              {tabFuncs.map((fk) => {
                const label = FUNCTION_LABELS[fk];
                const checked = funcs[fk];
                return (
                  <label key={fk}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                      checked ? "bg-green-50 border-green-200 text-green-800" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                    }`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFunc(fk)}
                      className="accent-green-600 w-4 h-4"
                    />
                    <span className="text-xs">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Note about CEO-only functions */}
      <p className="text-xs text-gray-400 italic">
        Note: Adding employees/consultants, approving transactions, and approving procurement are always restricted to the CEO regardless of permissions.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-navy hover:bg-brand-navy/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
          {isPending ? "Saving…" : "Save Permissions"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ Saved</span>
        )}
      </div>
    </div>
  );
}
