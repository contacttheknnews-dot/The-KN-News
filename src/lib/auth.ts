import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { Role } from "./constants";

const COOKIE_NAME = "kn_session";
// AUTH_SECRET is mandatory in EVERY environment. A hardcoded fallback is public
// knowledge — any non-production deploy (staging, preview, self-host) using it
// lets anyone forge a SUPER_ADMIN session JWT. Fail fast instead.
if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to your environment."
  );
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    // Re-validate against the DB on every request so a disabled, deleted, or
    // role-changed account loses access immediately — not when its 7-day token
    // happens to expire. Role/identity come from the DB, not the (stale) token.
    const user = await prisma.user.findUnique({
      where: { id: payload.id as number },
      select: { id: true, email: true, name: true, role: true, active: true },
    });
    if (!user || !user.active) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
    };
  } catch {
    return null;
  }
}

// Server-side guard for admin pages/actions. SUPER_ADMIN always passes.
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (roles && session.role !== "SUPER_ADMIN" && !roles.includes(session.role)) {
    redirect("/admin?denied=1");
  }
  return session;
}

export async function logActivity(userId: number, action: string, detail?: string) {
  try {
    await prisma.activityLog.create({ data: { userId, action, detail } });
  } catch {
    // activity logging must never break the main flow
  }
}
