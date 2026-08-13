"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type ActionResult } from "@/app/actions/public";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    subscribeNewsletter,
    null
  );

  return (
    <form action={formAction} className={compact ? "" : "max-w-md mx-auto"}>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="अपना ईमेल दर्ज करें"
          className="flex-1 min-w-0 rounded-md border border-kn-border bg-white px-3 py-2.5 text-sm outline-none focus:border-kn-red"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-kn-red px-5 py-2.5 text-sm font-bold text-white hover:bg-kn-red-dark disabled:opacity-60 transition-colors whitespace-nowrap"
        >
          {pending ? "..." : "Subscribe"}
        </button>
      </div>
      {state && (
        <p
          className={`mt-2 text-xs ${state.ok ? "text-green-700" : "text-kn-red"}`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
