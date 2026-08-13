import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDateTime, istDateTimeInputValue } from "@/lib/utils";
import { deleteBreaking, toggleBreaking } from "../actions";
import { DeleteButton, ActionButton } from "../ui";
import BreakingForm from "./BreakingForm";

export const dynamic = "force-dynamic";

export default async function BreakingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireUser(["EDITOR"]);
  const sp = await searchParams;
  const items = await prisma.breakingNews.findMany({ orderBy: { order: "asc" } });
  const editing = sp.edit ? items.find((i) => i.id === Number(sp.edit)) : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Breaking News</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {items.map((b) => (
            <div key={b.id} className="p-4 flex items-start gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${b.active ? "bg-green-500" : "bg-neutral-300"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{b.text}</p>
                <p className="text-[11px] text-kn-muted mt-1">
                  Order: {b.order}
                  {b.link && <> · Link: {b.link}</>}
                  {b.startAt && <> · From: {formatHindiDateTime(b.startAt)}</>}
                  {b.endAt && <> · Till: {formatHindiDateTime(b.endAt)}</>}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ActionButton
                  label={b.active ? "Deactivate" : "Activate"}
                  onAction={toggleBreaking.bind(null, b.id, !b.active)}
                />
                <a href={`/admin/breaking?edit=${b.id}`} className="text-xs font-bold hover:underline">
                  Edit
                </a>
                <DeleteButton onDelete={deleteBreaking.bind(null, b.id)} />
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="p-8 text-center text-sm text-kn-muted">कोई breaking news नहीं।</p>
          )}
        </div>
        <BreakingForm
          key={editing?.id ?? "new"}
          item={
            editing
              ? {
                  id: editing.id,
                  text: editing.text,
                  link: editing.link ?? "",
                  active: editing.active,
                  order: editing.order,
                  startAt: istDateTimeInputValue(editing.startAt),
                  endAt: istDateTimeInputValue(editing.endAt),
                }
              : null
          }
        />
      </div>
    </div>
  );
}
