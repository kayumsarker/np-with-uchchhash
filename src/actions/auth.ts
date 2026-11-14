"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-emails";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null; email: string };

const GENERIC_ERROR = "Invalid email or password.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required.", email };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) return { error: GENERIC_ERROR, email };

  // Valid Supabase user but not on the allowlist → end the session immediately.
  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut({ scope: "local" });
    return { error: "This account is not authorized to access the admin area.", email };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/admin/login");
}
