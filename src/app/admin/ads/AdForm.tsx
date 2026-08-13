"use client";

import { useActionState } from "react";
import { AD_PLACEMENTS } from "@/lib/constants";
import { saveAd, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

type Item = {
  id: number;
  advertiserName: string;
  imageDesktop: string;
  imageMobile: string;
  url: string;
  placement: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

export default function AdForm({ item }: { item: Item | null }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveAd,
    null
  );

  return (
    <form action={formAction} className="bg-white rounded-lg border border-kn-border p-5 space-y-3.5">
      <h2 className="font-bold">{item ? `Edit: ${item.advertiserName}` : "नया Advertisement"}</h2>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label className={labelCls}>Advertiser Name *</label>
        <input name="advertiserName" required defaultValue={item?.advertiserName} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Desktop Banner URL * (JPG/PNG/WebP/SVG — Media Library से अपलोड करें)</label>
        <input name="imageDesktop" required defaultValue={item?.imageDesktop} className={inputCls} placeholder="/uploads/banner.png" />
      </div>
      <div>
        <label className={labelCls}>Mobile Banner URL (वैकल्पिक)</label>
        <input name="imageMobile" defaultValue={item?.imageMobile} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Click URL *</label>
        <input name="url" required defaultValue={item?.url} className={inputCls} placeholder="https://advertiser.com" />
      </div>
      <div>
        <label className={labelCls}>Placement</label>
        <select name="placement" defaultValue={item?.placement ?? "SIDEBAR"} className={inputCls}>
          {AD_PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Start Date</label>
          <input type="date" name="startDate" defaultValue={item?.startDate} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>End Date</label>
          <input type="date" name="endDate" defaultValue={item?.endDate} className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={item?.active ?? true} className="accent-kn-red h-4 w-4" />
        Active
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
