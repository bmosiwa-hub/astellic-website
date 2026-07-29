"use client";

import { useEffect } from "react";

/**
 * Enhances the tax-remittance record form: nothing is pre-selected, and as the
 * user ticks which outstanding taxes/pensions to remit, this keeps a live
 * "selected total" and sets the amount-paid field to that total. The amount
 * stays editable (for a partial or over-payment); ticking/unticking re-syncs it.
 *
 * Works against the server-rendered checkboxes (class `remit-check`, carrying a
 * `data-remaining` balance), so no record data is duplicated client-side.
 */
export default function RemittanceSelection() {
  useEffect(() => {
    const boxes = Array.from(document.querySelectorAll<HTMLInputElement>("input.remit-check"));
    if (boxes.length === 0) return;

    const amountInput = document.querySelector<HTMLInputElement>('input[name="amountPaid"]');
    const totalEl     = document.getElementById("remit-selected-total");
    const countEl     = document.getElementById("remit-selected-count");

    const fmt = (n: number) =>
      new Intl.NumberFormat("en-MW", { style: "currency", currency: "MWK", minimumFractionDigits: 2 }).format(n);

    function sync() {
      const checked = boxes.filter((b) => b.checked);
      const total = checked.reduce((s, b) => s + (parseFloat(b.dataset.remaining || "0") || 0), 0);
      if (totalEl) totalEl.textContent = fmt(total);
      if (countEl) countEl.textContent = String(checked.length);
      if (amountInput) {
        amountInput.value = total.toFixed(2);
        // Notify any listeners (and keep validation state in sync).
        amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    boxes.forEach((b) => b.addEventListener("change", sync));
    sync(); // start from an empty (nothing-selected) state

    return () => boxes.forEach((b) => b.removeEventListener("change", sync));
  }, []);

  return null;
}
