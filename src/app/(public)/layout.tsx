import Link from "next/link";
import { NavLinks } from "@/components/public/nav-links";
import { SocialLinks } from "@/components/public/social-links";
import { getSiteSettings } from "@/lib/data/public";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="font-heading text-lg font-bold tracking-tight">
            <span className="text-primary">Natural Philosophy</span>{" "}
            <span className="hidden text-muted sm:inline">with Uchchhash</span>
          </Link>
          <NavLinks />
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
    </>
  );
}

async function Footer() {
  const settings = await getSiteSettings();
  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading font-bold">Natural Philosophy with {settings.tutorName}</p>
          <p className="mt-1 text-sm text-muted">{settings.tagline}</p>
          <p className="mt-3 text-xs text-muted">Free physics lessons. No sign-up, no fees.</p>
        </div>
        <SocialLinks settings={settings} />
      </div>
    </footer>
  );
}
