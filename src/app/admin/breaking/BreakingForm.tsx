"use client";

import { useActionState } from "react";
import { saveBreaking, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

type Item = {
  id: number;
  text: string;
  link: string;
  active: boolean;
  order: number;
  startAt: string;
  endAt: string;
};

export default function BreakingForm({ item }: { item: Item | null }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveBreaking,
    null
  );

  return (
    <form action={formAction} className="bg-white rounded-lg border border-kn-border p-5 space-y-4">
      <h2 className="font-bold">{item ? `Edit #${item.id}` : "नई Breaking News"}</h2>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label className={labelCls}>Text *</label>
        <textarea name="text" required rows={2} defaultValue={item?.text} className={`${inputCls} resize-y`} />
      </div>
      <div>
        <label className={labelCls}>Link (वैकल्पिक)</label>
        <input name="link" defaultValue={item?.link} className={inputCls} placeholder="/news/slug" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Order</label>
          <input type="number" name="order" defaultValue={item?.order ?? 0} className={inputCls} />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked={item?.active ?? true} className="accent-kn-red h-4 w-4" />
          Active
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Schedule From</label>
          <input type="datetime-local" name="startAt" defaultValue={item?.startAt} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Schedule Till</label>
          <input type="datetime-local" name="endAt" defaultValue={item?.endAt} className={inputCls} />
        </div>
      </div>
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "…" : "Save"}
      </button>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-kn-red"}`}>{state.message}</p>
      )}
      {item && (
        <a href="/admin/breaking" className="block text-center text-xs text-kn-muted hover:underline">
          + नई breaking news जोड़ें
        </a>
      )}
    </form>
  );
}
