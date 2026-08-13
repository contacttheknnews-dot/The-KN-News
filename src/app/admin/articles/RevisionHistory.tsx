"use client";

import { useTransition } from "react";
import { restoreRevision } from "../actions";
import { formatHindiDateTime } from "@/lib/utils";

export type RevisionItem = {
  id: number;
  title: string;
  savedBy: string | null;
  createdAt: string; // ISO
};

export default function RevisionHistory({
  articleId,
  revisions,
}: {
  articleId: number;
  revisions: RevisionItem[];
}) {
  const [pending, startTransition] = useTransition();

  if (revisions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-kn-border p-5 space-y-3">
      <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">
        Revision History
      </h2>
      <ul className="divide-y divide-kn-border">
        {revisions.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{r.title}</p>
              <p className="text-[11px] text-kn-muted">
                {formatHindiDateTime(r.createdAt)}
                {r.savedBy ? ` · ${r.savedBy}` : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("इस पुराने version को restore करें? मौजूदा version भी history में सुरक्षित रहेगा।")) return;
                startTransition(async () => {
                  const res = await restoreRevision(articleId, r.id);
                  if (res.ok) window.location.reload();
                  else window.alert(res.message);
                });
              }}
              className="shrink-0 rounded border border-kn-border bg-white px-3 py-1 text-xs font-bold hover:bg-kn-gray disabled:opacity-50"
            >
              {pending ? "…" : "Restore"}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-kn-muted">
        हर save से पहले का version अपने-आप सुरक्षित होता है (अधिकतम 20)।
      </p>
    </div>
  );
}
