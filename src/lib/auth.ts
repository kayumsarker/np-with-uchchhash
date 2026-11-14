import "server-only";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-emails";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Admin = { id: string; email: string };

/**
 * Returns the signed-in admin, or null.
 * getClaims() verifies the JWT signature (locally with asymmetric keys),
 * unlike getSession() which must never be trusted on the server.
 */
export async function getAdmin(): Promise<Admin | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const email = typeof data.claims.email === "string" ? data.claims.email : null;
  if (!email || !isAdminEmail(email)) return null;

  return { id: data.claims.sub, email };
}

/**
 * Guard for EVERY server action, page and route handler that touches admin data.
 * Prisma connects as the DB owner, so Supabase RLS does not protect us —
 * this check (not proxy.ts alone) is the real security boundary.
 * Redirects to the login page when the caller is not an admin.
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
