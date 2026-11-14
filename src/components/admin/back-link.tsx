import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </Link>
  );
}
