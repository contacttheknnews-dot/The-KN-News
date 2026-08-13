import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDateTime } from "@/lib/utils";
import { removeSubscriber } from "../actions";
import { DeleteButton } from "../ui";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  await requireUser(["EDITOR"]);
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h1 className="text-2xl font-extrabold">
          Newsletter Subscribers ({subscribers.length})
        </h1>
        <a
          href="/admin/newsletter/export"
          className="rounded-md bg-kn-dark px-5 py-2.5 text-sm font-bold text-white hover:bg-black"
        >
          Export CSV
        </a>
      </div>
      <div className="bg-white rounded-lg border border-kn-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-kn-gray text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kn-border">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-kn-muted">{formatHindiDateTime(s.createdAt)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      s.active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {s.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton onDelete={removeSubscriber.bind(null, s.id)} label="Remove" />
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-kn-muted">
                  अभी कोई subscriber नहीं।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-kn-muted">
        Campaigns: exported CSV को Mailchimp / Brevo जैसे टूल में इंपोर्ट कर न्यूज़लेटर
        भेजें। SMTP इंटीग्रेशन production सेटअप में जोड़ा जा सकता है।
      </p>
    </div>
  );
}
