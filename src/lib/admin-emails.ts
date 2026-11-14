/**
 * ADMIN_EMAILS allowlist check. Pure function (no Next.js APIs) so it can be used
 * from proxy.ts, server actions and route handlers alike.
 * Empty or missing ADMIN_EMAILS → nobody is admin (fail closed).
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}
