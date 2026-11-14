import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/admin-emails";

/**
 * Next.js 16 Proxy (formerly middleware). Runs only on /admin routes.
 * 1. Refreshes the Supabase session cookie.
 * 2. Sends non-admins to /admin/login, and signed-in admins away from it.
 * This is a convenience layer — every page/action ALSO calls requireAdmin().
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let authHeaders: Record<string, string> = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          authHeaders = { ...authHeaders, ...headers };
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not put code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims.email === "string" ? data.claims.email : null;
  const isAdmin = isAdminEmail(email);
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!isAdmin && !isLoginPage)
    return redirectWithCookies(request, "/admin/login", response, authHeaders);
  if (isAdmin && isLoginPage) return redirectWithCookies(request, "/admin", response, authHeaders);

  return response;
}

/** A redirect must carry any refreshed auth cookies + no-cache headers, or the session is lost. */
function redirectWithCookies(
  request: NextRequest,
  pathname: string,
  from: NextResponse,
  headers: Record<string, string>,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  Object.entries(headers).forEach(([key, value]) => redirect.headers.set(key, value));
  return redirect;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
