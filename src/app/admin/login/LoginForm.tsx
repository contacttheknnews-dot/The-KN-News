"use client";

import { useActionState } from "react";
import { login } from "../actions";
import type { AdminActionResult } from "../actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    login,
    null
  );

  return (
    <form action={formAction} className="space-y-3.5">
      <input
        type="email"
        name="email"
        required
        placeholder="ईमेल"
        autoComplete="username"
        className="w-full rounded-md border border-kn-border px-3 py-2.5 text-sm outline-none focus:border-kn-red"
      />
      <input
        type="password"
        name="password"
        required
        placeholder="पासवर्ड"
        autoComplete="current-password"
        className="w-full rounded-md border border-kn-border px-3 py-2.5 text-sm outline-none focus:border-kn-red"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-kn-red px-5 py-2.5 text-sm font-bold text-white hover:bg-kn-red-dark disabled:opacity-60"
      >
        {pending ? "लॉगिन हो रहा है…" : "लॉगिन करें"}
      </button>
      {state && !state.ok && (
        <p className="text-sm text-kn-red" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
