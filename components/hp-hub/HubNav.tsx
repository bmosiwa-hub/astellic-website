"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/hp-hub", label: "Home", exact: true },
  { href: "/hp-hub/malawi", label: "Malawi" },
  { href: "/hp-hub/search", label: "Search" },
  { href: "/hp-hub/themes", label: "Themes" },
  { href: "/hp-hub/types", label: "Document types" },
  { href: "/hp-hub/submit", label: "Submit a document" },
  { href: "/hp-hub/about", label: "About" },
];

/** Section navigation under the site header. Scrolls sideways on phones. */
export default function HubNav() {
  const pathname = usePathname();
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-6 lg:gap-10">
        <Link href="/hp-hub" className="shrink-0 py-3.5 flex items-baseline gap-2" aria-label="HP-Hub home">
          <span className="font-bold text-brand-navy tracking-tight">HP-Hub</span>
          <span className="hidden lg:inline text-xs text-brand-muted">Health Policy Intelligence Hub</span>
        </Link>
        <nav aria-label="HP-Hub" className="min-w-0 flex-1 -mr-6 lg:mr-0">
          <ul className="flex items-center gap-5 lg:gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-6 lg:pr-0 lg:justify-end">
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li key={l.href} className="shrink-0">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`block py-3.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
                      active ? "border-brand-gold text-brand-navy font-semibold" : "border-transparent text-brand-muted hover:text-brand-navy"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
