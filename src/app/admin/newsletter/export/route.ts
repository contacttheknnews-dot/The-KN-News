import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// CSV export of newsletter subscribers (admin only; middleware + session check).
export async function GET() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "EDITOR"].includes(session.role)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  const rows = [
    "email,subscribed_at,active",
    ...subscribers.map(
      (s) => `${s.email},${s.createdAt.toISOString()},${s.active ? "yes" : "no"}`
    ),
  ];
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kn-news-subscribers.csv"`,
    },
  });
}
