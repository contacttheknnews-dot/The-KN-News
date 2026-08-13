"use client";

import { useActionState } from "react";
import { submitContact, type ActionResult } from "@/app/actions/public";

const inputCls =
  "w-full rounded-md border border-kn-border px-3 py-2.5 text-sm outline-none focus:border-kn-red";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitContact,
    null
  );

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input name="name" required placeholder="नाम *" className={inputCls} />
      <input name="email" type="email" required placeholder="ईमेल *" className={inputCls} />
      <input name="subject" placeholder="विषय" className={inputCls} />
      <textarea name="message" required rows={5} placeholder="संदेश *" className={`${inputCls} resize-y`} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-kn-red px-5 py-3 text-sm font-bold text-white hover:bg-kn-red-dark disabled:opacity-60"
      >
        {pending ? "भेजा जा रहा है…" : "संदेश भेजें"}
      </button>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-kn-red"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
