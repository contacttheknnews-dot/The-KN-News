import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  await requireUser([]); // SUPER_ADMIN only
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Admin Activity Log</h1>
      <div className="bg-white rounded-lg border border-kn-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-kn-gray text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Detail</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kn-border">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{log.user.name}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded bg-kn-gray px-2 py-0.5 text-[11px] font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-kn-muted">{log.detail ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs text-kn-muted whitespace-nowrap">
                  {formatHindiDateTime(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
