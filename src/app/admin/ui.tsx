"use client";

// Small shared client widgets for the admin panel.

import { useTransition } from "react";

export function DeleteButton({
  onDelete,
  label = "Delete",
  confirmText = "क्या आप वाकई हटाना चाहते हैं?",
}: {
  onDelete: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(() => onDelete());
      }}
      className="text-xs font-bold text-kn-red hover:underline disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

export function ActionButton({
  onAction,
  label,
  className = "text-xs font-bold text-kn-dark hover:underline disabled:opacity-50",
}: {
  onAction: () => Promise<void>;
  label: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => onAction())}
      className={className}
    >
      {pending ? "…" : label}
    </button>
  );
}

export const inputCls =
  "w-full rounded-md border border-kn-border bg-white px-3 py-2 text-sm outline-none focus:border-kn-red";
export const labelCls = "block text-xs font-bold text-neutral-600 mb-1";
export const btnPrimary =
  "rounded-md bg-kn-red px-5 py-2.5 text-sm font-bold text-white hover:bg-kn-red-dark disabled:opacity-60";
export const btnSecondary =
  "rounded-md border border-kn-border bg-white px-4 py-2 text-sm font-semibold hover:bg-kn-gray";
