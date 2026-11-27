"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/hp-hub/search", label: "Search", match: ["/hp-hub/search", "/hp-hub/types"] },
  { href: "/hp-hub/countries", label: "Countries", match: ["/hp-hub/countries", "/hp-hub/malawi"] },
  { href: "/hp-hub/themes", label: "Themes", match: ["/hp-hub/themes"] },
  { href: "/hp-hub/about", label: "About", match: ["/hp-hub/about"] },
];

/**
 * Compact section navigation under the site header. On phones "Submit" sits
 * at the end of the (swipeable) list; from tablet width up it's a separate
 * outlined button.
 */
export default function HubNav() {
  const pathname = usePathname();
  const isActive = (l: (typeof LINKS)[number]) => l.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
  const onSubmit = pathname === "/hp-hub/submit";
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-3.5 sm:gap-8">
        <Link href="/hp-hub" className="shrink-0 py-3 font-bold text-brand-navy tracking-tight" aria-label="HP-Hub home">
          HP-Hub
        </Link>
        <nav aria-label="HP-Hub" className="min-w-0 flex-1">
          <ul className="flex items-center gap-3.5 sm:gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LINKS.map((l) => {
              const active = isActive(l);
              return (
                <li key={l.href} className="shrink-0">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`block py-3 text-sm border-b-2 transition-colors ${
                      active ? "border-brand-gold text-brand-navy font-semibold" : "border-transparent text-brand-muted hover:text-brand-navy"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li className="shrink-0 sm:hidden">
              <Link
                href="/hp-hub/submit"
                aria-current={onSubmit ? "page" : undefined}
                className={`block py-3 text-sm font-semibold border-b-2 ${onSubmit ? "border-brand-gold text-brand-navy" : "border-transparent text-brand-teal"}`}
              >
                Submit
              </Link>
            </li>
          </ul>
        </nav>
        <Link
          href="/hp-hub/submit"
          aria-current={onSubmit ? "page" : undefined}
          className="shrink-0 hidden sm:inline-flex items-center h-8 px-3 rounded border border-brand-navy/25 text-xs font-semibold text-brand-navy hover:border-brand-navy hover:bg-brand-light transition-colors"
        >
          Submit a document
        </Link>
      </div>
    </div>
  );
}
