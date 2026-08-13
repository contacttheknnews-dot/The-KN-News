import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { logout } from "./actions";
import AdminNav from "./AdminNav";

export const metadata = {
  title: { default: "Admin — The KN News", template: "%s | Admin — The KN News" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Unauthenticated → middleware only allows /admin/login; render it bare.
  if (!session) {
    return <div className="min-h-screen bg-neutral-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-kn-dark text-neutral-300 min-h-screen sticky top-0 max-h-screen overflow-y-auto">
        <Link href="/admin" className="block px-5 py-4 border-b border-white/10">
          <p className="text-lg font-extrabold text-white">
            The <span className="bg-kn-red px-1 rounded-sm">KN</span> News
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Admin Dashboard</p>
        </Link>
        <AdminNav role={session.role} />
        <div className="mt-auto border-t border-white/10 p-4">
          <p className="text-sm font-bold text-white">{session.name}</p>
          <p className="text-[11px] text-neutral-400">{ROLE_LABELS[session.role]}</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <Link href="/" className="text-neutral-300 hover:text-white underline">
              साइट देखें
            </Link>
            <form action={logout}>
              <button className="text-kn-red hover:underline font-semibold">Logout</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        {/* mobile top bar */}
        <div className="md:hidden flex items-center justify-between bg-kn-dark text-white px-4 py-3">
          <Link href="/admin" className="font-extrabold">
            KN Admin
          </Link>
          <form action={logout}>
            <button className="text-xs text-kn-red font-bold">Logout</button>
          </form>
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
