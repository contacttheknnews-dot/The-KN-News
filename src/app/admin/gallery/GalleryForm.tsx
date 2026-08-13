"use client";

import { useActionState } from "react";
import { saveGallery, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

type Item = {
  id: number;
  title: string;
  description: string;
  categoryId: number | "";
  images: string;
};

export default function GalleryForm({
  item,
  categories,
}: {
  item: Item | null;
  categories: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveGallery,
    null
  );

  return (
    <form action={formAction} className="bg-white rounded-lg border border-kn-border p-5 space-y-3.5">
      <h2 className="font-bold">{item ? "Edit Gallery" : "नई Gallery"}</h2>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label className={labelCls}>Title *</label>
        <input name="title" required defaultValue={item?.title} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" rows={2} defaultValue={item?.description} className={`${inputCls} resize-y`} />
      </div>
      <div>
        <label className={labelCls}>Category</label>
        <select name="categoryId" defaultValue={String(item?.categoryId || "")} className={inputCls}>
          <option value="">— कोई नहीं —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>
          Images * (एक प्रति लाइन: <code>URL | caption</code>)
        </label>
        <textarea
          name="images"
          required
          rows={8}
          defaultValue={item?.images}
          className={`${inputCls} resize-y font-mono text-xs`}
          placeholder={"/uploads/photo1.jpg | पहली फोटो का कैप्शन\n/uploads/photo2.jpg | दूसरी फोटो"}
        />
      </div>
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "…" : "Save"}
      </button>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-kn-red"}`}>{state.message}</p>
      )}
    </form>
  );
}
