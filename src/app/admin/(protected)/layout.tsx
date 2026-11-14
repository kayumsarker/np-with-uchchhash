import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/actions/auth";
import { Toaster } from "@/components/admin/toaster";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-heading font-bold text-primary">Admin</span>
          <nav aria-label="Admin" className="flex flex-wrap gap-4 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <Suspense fallback={null}>
              <AdminSession />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <Toaster />
    </div>
  );
}

async function AdminSession() {
  const admin = await requireAdmin();
  return (
    <form action={logout} className="flex items-center gap-3 text-sm">
      <span className="hidden text-muted sm:inline">{admin.email}</span>
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 hover:border-primary hover:text-primary"
      >
        Log out
      </button>
    </form>
  );
}
