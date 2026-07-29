"use client";

import { useEffect } from "react";

/**
 * Enhances the tax-remittance record form: as the user checks/unchecks which
 * outstanding taxes/pensions to remit, this keeps a live "selected total" and
 * pre-fills the amount-paid field with that total. The amount stays editable
 * (for a partial or over-payment); changing the selection re-syncs it.
 *
 * Works against the server-rendered checkboxes tagged `data-remit-item` with a
 * `data-remaining` balance, so no record data has to be duplicated client-side.
 */
export default function RemittanceSelection() {
  useEffect(() => {
    const boxes = Array.from(
      document.querySelectorAll<HTMLInputElement>("input[type=checkbox][data-remit-item]"),
    );
    if (boxes.length === 0) return;

    const amountInput = document.querySelector<HTMLInputElement>('input[name="amountPaid"]');
    const totalEl     = document.getElementById("remit-selected-total");
    const countEl     = document.getElementById("remit-selected-count");

    const fmt = (n: number) =>
      new Intl.NumberFormat("en-MW", { style: "currency", currency: "MWK", minimumFractionDigits: 2 }).format(n);

    function selectedTotal() {
      return boxes
        .filter((b) => b.checked)
        .reduce((s, b) => s + (parseFloat(b.dataset.remaining || "0") || 0), 0);
    }
    function selectedCount() {
      return boxes.filter((b) => b.checked).length;
    }

    function syncFromSelection() {
      const total = selectedTotal();
      if (totalEl) totalEl.textContent = fmt(total);
      if (countEl) countEl.textContent = String(selectedCount());
      if (amountInput) amountInput.value = total.toFixed(2);
    }

    boxes.forEach((b) => b.addEventListener("change", syncFromSelection));
    syncFromSelection();

    return () => boxes.forEach((b) => b.removeEventListener("change", syncFromSelection));
  }, []);

  return null;
}
