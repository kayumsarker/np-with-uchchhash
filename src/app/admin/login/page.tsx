import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-bold">Admin login</h1>
        <p className="mb-6 text-sm text-muted">Natural Philosophy with Uchchhash</p>
        <LoginForm />
      </div>
    </main>
  );
}
