"use client";

import { useActionState } from "react";
import { saveVideo, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

type Item = {
  id: number;
  title: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  categoryId: number | "";
};

export default function VideoForm({
  item,
  categories,
}: {
  item: Item | null;
  categories: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveVideo,
    null
  );

  return (
    <form action={formAction} className="bg-white rounded-lg border border-kn-border p-5 space-y-3.5">
      <h2 className="font-bold">{item ? "Edit Video" : "नया Video"}</h2>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label className={labelCls}>Title *</label>
        <input name="title" required defaultValue={item?.title} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>YouTube URL या Video ID *</label>
        <input name="youtubeId" required defaultValue={item?.youtubeId} className={inputCls} placeholder="https://youtube.com/watch?v=…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Duration</label>
          <input name="duration" defaultValue={item?.duration} className={inputCls} placeholder="5:24" />
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
      </div>
      <div>
        <label className={labelCls}>Custom Thumbnail URL (वैकल्पिक)</label>
        <input name="thumbnail" defaultValue={item?.thumbnail} className={inputCls} />
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
