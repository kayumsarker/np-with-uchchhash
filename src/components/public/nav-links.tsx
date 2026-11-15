"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (className: string) =>
    NAV.map((item) => {
      const active = isActive(pathname, item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          onClick={() => setOpen(false)}
          className={`${className} ${active ? "text-foreground" : "text-muted hover:text-foreground"}`}
        >
          {item.label}
        </Link>
      );
    });

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
        {links(
          "rounded-lg px-3 py-2 text-sm font-medium transition aria-[current=page]:bg-white/5",
        )}
      </nav>

      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-lg border border-border sm:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full flex flex-col border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:hidden"
        >
          {links("rounded-lg px-3 py-3 font-medium aria-[current=page]:bg-white/5")}
        </nav>
      )}
    </>
  );
}
