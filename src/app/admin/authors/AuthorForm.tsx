"use client";

import { useActionState } from "react";
import { saveAuthor, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

type Item = {
  id: number;
  name: string;
  slug: string;
  photo: string;
  bio: string;
  designation: string;
  email: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

export default function AuthorForm({ item }: { item: Item | null }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveAuthor,
    null
  );

  return (
    <form action={formAction} className="bg-white rounded-lg border border-kn-border p-5 space-y-3.5">
      <h2 className="font-bold">{item ? `Edit: ${item.name}` : "नया Author"}</h2>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label className={labelCls}>Name *</label>
        <input name="name" required defaultValue={item?.name} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Slug</label>
          <input name="slug" defaultValue={item?.slug} className={inputCls} placeholder="auto" />
        </div>
        <div>
          <label className={labelCls}>Designation</label>
          <input name="designation" defaultValue={item?.designation} className={inputCls} placeholder="वरिष्ठ संवाददाता" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Photo URL</label>
        <input name="photo" defaultValue={item?.photo} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Bio</label>
        <textarea name="bio" rows={3} defaultValue={item?.bio} className={`${inputCls} resize-y`} />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input name="email" type="email" defaultValue={item?.email} className={inputCls} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Facebook</label>
          <input name="facebook" defaultValue={item?.facebook} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>X/Twitter</label>
          <input name="twitter" defaultValue={item?.twitter} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Instagram</label>
          <input name="instagram" defaultValue={item?.instagram} className={inputCls} />
        </div>
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
