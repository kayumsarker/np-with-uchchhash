import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-accent">404 · Δx = ?</p>
      <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">
        This page doesn&apos;t exist, or the lesson isn&apos;t published yet.
      </p>
      <Link
        href="/courses"
        className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        Browse courses
      </Link>
    </div>
  );
}
