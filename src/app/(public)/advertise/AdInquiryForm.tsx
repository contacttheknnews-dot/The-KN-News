"use client";

import { useActionState } from "react";
import { submitAdInquiry, type ActionResult } from "@/app/actions/public";

const inputCls =
  "w-full rounded-md border border-kn-border px-3 py-2.5 text-sm outline-none focus:border-kn-red";

export default function AdInquiryForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitAdInquiry,
    null
  );

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-3.5 sm:grid-cols-2">
        <input name="name" required placeholder="नाम *" className={inputCls} />
        <input name="company" placeholder="कंपनी" className={inputCls} />
        <input name="email" type="email" required placeholder="ईमेल *" className={inputCls} />
        <input name="phone" placeholder="फोन" className={inputCls} />
      </div>
      <select name="requirement" className={inputCls} defaultValue="">
        <option value="" disabled>
          विज्ञापन की आवश्यकता चुनें
        </option>
        <option>Website Banner Advertising</option>
        <option>Sponsored Content</option>
        <option>Video Promotion</option>
        <option>Social Media Promotion</option>
        <option>Brand Partnership</option>
        <option>अन्य</option>
      </select>
      <select name="budget" className={inputCls} defaultValue="">
        <option value="" disabled>
          अनुमानित बजट चुनें
        </option>
        <option>₹5,000 से कम</option>
        <option>₹5,000 – ₹25,000</option>
        <option>₹25,000 – ₹1,00,000</option>
        <option>₹1,00,000 से अधिक</option>
      </select>
      <textarea name="message" rows={4} placeholder="संदेश" className={`${inputCls} resize-y`} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-kn-red px-5 py-3 text-sm font-bold text-white hover:bg-kn-red-dark disabled:opacity-60"
      >
        {pending ? "भेजा जा रहा है…" : "Advertising Team से संपर्क करें"}
      </button>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-kn-red"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
