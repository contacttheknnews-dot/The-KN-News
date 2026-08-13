"use client";

import { useActionState } from "react";
import { saveCategory, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

type Item = {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  order: number;
  showInNav: boolean;
  parentId: number | "";
};

export default function CategoryForm({
  item,
  parents,
}: {
  item: Item | null;
  parents: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveCategory,
    null
  );

  return (
    <form action={formAction} className="bg-white rounded-lg border border-kn-border p-5 space-y-4">
      <h2 className="font-bold">{item ? `Edit: ${item.name}` : "नई Category"}</h2>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>नाम (हिंदी) *</label>
          <input name="name" required defaultValue={item?.name} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Name (English)</label>
          <input name="nameEn" defaultValue={item?.nameEn} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Slug</label>
        <input name="slug" defaultValue={item?.slug} className={inputCls} placeholder="auto" />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" rows={2} defaultValue={item?.description} className={`${inputCls} resize-y`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Parent (subcategory के लिए)</label>
          <select name="parentId" defaultValue={String(item?.parentId || "")} className={inputCls}>
            <option value="">— मुख्य श्रेणी —</option>
            {parents
              .filter((p) => p.id !== item?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Order</label>
          <input type="number" name="order" defaultValue={item?.order ?? 0} className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="showInNav" defaultChecked={item?.showInNav ?? true} className="accent-kn-red h-4 w-4" />
        Navigation में दिखाएं
      </label>
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "…" : "Save"}
      </button>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-kn-red"}`}>{state.message}</p>
      )}
    </form>
  );
}
