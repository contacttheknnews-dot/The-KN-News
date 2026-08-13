"use client";

import { useActionState } from "react";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { saveUser, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary } from "../ui";

type Item = { id: number; name: string; email: string; role: string; active: boolean };

export default function UserForm({ item }: { item: Item | null }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveUser,
    null
  );

  return (
    <form action={formAction} className="bg-white rounded-lg border border-kn-border p-5 space-y-3.5">
      <h2 className="font-bold">{item ? `Edit: ${item.name}` : "नया User"}</h2>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label className={labelCls}>Name *</label>
        <input name="name" required defaultValue={item?.name} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Email *</label>
        <input name="email" type="email" required defaultValue={item?.email} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Role</label>
        <select name="role" defaultValue={item?.role ?? "EDITOR"} className={inputCls}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>
          Password {item ? "(खाली छोड़ें तो नहीं बदलेगा)" : "* (कम से कम 8 अक्षर)"}
        </label>
        <input name="password" type="password" autoComplete="new-password" className={inputCls} />
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
