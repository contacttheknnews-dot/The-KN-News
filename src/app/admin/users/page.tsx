import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { formatHindiDate } from "@/lib/utils";
import { deleteUser } from "../actions";
import { DeleteButton } from "../ui";
import UserForm from "./UserForm";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const me = await requireUser([]); // SUPER_ADMIN only
  const sp = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const editing = sp.edit ? users.find((u) => u.id === Number(sp.edit)) : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Users & Roles</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kn-red-light text-kn-red font-bold">
                {u.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">
                  {u.name}
                  {u.id === me.id && <span className="text-[11px] text-kn-muted"> (आप)</span>}
                  {!u.active && (
                    <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                      INACTIVE
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-kn-muted">
                  {u.email} · {ROLE_LABELS[u.role] ?? u.role} · जुड़े {formatHindiDate(u.createdAt)}
                </p>
              </div>
              <a href={`/admin/users?edit=${u.id}`} className="text-xs font-bold hover:underline">
                Edit
              </a>
              {u.id !== me.id && <DeleteButton onDelete={deleteUser.bind(null, u.id)} />}
            </div>
          ))}
        </div>
        <UserForm
          key={editing?.id ?? "new"}
          item={
            editing
              ? {
                  id: editing.id,
                  name: editing.name,
                  email: editing.email,
                  role: editing.role,
                  active: editing.active,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
