"use client";

import { useActionState } from "react";
import { saveSettings, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

const FIELDS: { group: string; items: { key: string; label: string; placeholder?: string }[] }[] = [
  {
    group: "Contact Information",
    items: [
      { key: "contact.email", label: "Email", placeholder: "contact@theknnews.com" },
      { key: "contact.phone", label: "Phone", placeholder: "+91 90000 00000" },
      { key: "contact.whatsapp", label: "WhatsApp", placeholder: "+91 90000 00000" },
    ],
  },
  {
    group: "Social Media",
    items: [
      { key: "social.facebook", label: "Facebook URL" },
      { key: "social.instagram", label: "Instagram URL" },
      { key: "social.youtube", label: "YouTube URL" },
      { key: "social.x", label: "X (Twitter) URL" },
      { key: "social.telegram", label: "Telegram URL" },
      { key: "social.whatsapp", label: "WhatsApp Channel URL" },
    ],
  },
  {
    group: "SEO / Analytics",
    items: [
      { key: "seo.defaultTitle", label: "Default SEO Title Suffix" },
      { key: "seo.defaultDescription", label: "Default Meta Description" },
      { key: "analytics.note", label: "Analytics note (GA ID .env में सेट करें)" },
    ],
  },
];

export default function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveSettings,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {FIELDS.map((group) => (
        <div key={group.group} className="bg-white rounded-lg border border-kn-border p-5 space-y-3.5">
          <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">
            {group.group}
          </h2>
          {group.items.map((f) => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input
                name={f.key}
                defaultValue={settings[f.key] ?? ""}
                placeholder={f.placeholder}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      ))}
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "सेव हो रहा है…" : "Save Settings"}
      </button>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-kn-red"}`}>{state.message}</p>
      )}
    </form>
  );
}
