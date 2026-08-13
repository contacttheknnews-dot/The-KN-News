import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDateTime } from "@/lib/utils";
import { updateInquiryStatus } from "../actions";
import { ActionButton } from "../ui";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  await requireUser(["EDITOR", "AD_MANAGER"]);
  const [inquiries, messages] = await Promise.all([
    prisma.adInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold mb-5">Advertising Inquiries ({inquiries.length})</h1>
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {inquiries.map((q) => (
            <div key={q.id} className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm">{q.name}</p>
                {q.company && <span className="text-xs text-kn-muted">({q.company})</span>}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    q.status === "NEW"
                      ? "bg-kn-red text-white"
                      : q.status === "CONTACTED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {q.status}
                </span>
                <span className="ml-auto text-[11px] text-kn-muted">
                  {formatHindiDateTime(q.createdAt)}
                </span>
              </div>
              <p className="text-xs text-kn-muted mt-1">
                {q.email} {q.phone && `· ${q.phone}`} {q.requirement && `· ${q.requirement}`}{" "}
                {q.budget && `· Budget: ${q.budget}`}
              </p>
              {q.message && <p className="text-sm mt-1.5">{q.message}</p>}
              <div className="mt-2 flex gap-4">
                {q.status !== "CONTACTED" && (
                  <ActionButton
                    label="Mark Contacted"
                    onAction={updateInquiryStatus.bind(null, q.id, "CONTACTED")}
                  />
                )}
                {q.status !== "CLOSED" && (
                  <ActionButton
                    label="Close"
                    onAction={updateInquiryStatus.bind(null, q.id, "CLOSED")}
                  />
                )}
              </div>
            </div>
          ))}
          {inquiries.length === 0 && (
            <p className="p-8 text-center text-sm text-kn-muted">कोई inquiry नहीं।</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-extrabold mb-4">Contact Messages ({messages.length})</h2>
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {messages.map((m) => (
            <div key={m.id} className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm">{m.name}</p>
                <span className="text-xs text-kn-muted">{m.email}</span>
                <span className="ml-auto text-[11px] text-kn-muted">
                  {formatHindiDateTime(m.createdAt)}
                </span>
              </div>
              {m.subject && <p className="text-xs font-semibold mt-1">{m.subject}</p>}
              <p className="text-sm mt-1">{m.message}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="p-8 text-center text-sm text-kn-muted">कोई message नहीं।</p>
          )}
        </div>
      </div>
    </div>
  );
}
