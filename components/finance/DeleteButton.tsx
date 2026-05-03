"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestDeleteChange } from "@/lib/change-actions";

interface Props {
  entity: "Income" | "Expense";
  entityId: string;
}

export default function DeleteButton({ entity, entityId }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "confirm">("idle");
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await requestDeleteChange(entity, entityId);
      setStage("idle");
      router.refresh(); // re-render the server component list
    });
  };

  if (stage === "confirm") {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="text-xs text-gray-500">Sure?</span>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-40"
        >
          {isPending ? "…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setStage("idle")}
          className="text-xs text-gray-400 hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setStage("confirm")}
      className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
    >
      Delete
    </button>
  );
}
