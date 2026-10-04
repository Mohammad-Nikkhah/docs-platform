import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const getSession = cache(async () => auth());

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Redirects anonymous visitors to /login. */
export async function requireUser(callbackPath = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  return user;
}

/** Server-side admin check: role comes from the database session. */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/forbidden");
  return user;
}

export class AuthError extends Error {}

/** For Server Actions: throws instead of redirecting. */
export async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new AuthError("دسترسی غیرمجاز");
  return user;
}

export async function assertUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("برای انجام این کار باید وارد شوید");
  return user;
}
