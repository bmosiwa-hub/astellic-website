import Link from "next/link";

const links = [
  { label: "About", href: "/about" },
  { label: "Our Approach", href: "/approach" },
  { label: "Thematic Areas", href: "/thematic-areas" },
  { label: "Why Astellic", href: "/why-astellic" },
  { label: "Work With Us", href: "/work-with-us" },
  { label: "Get in Touch", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-bold text-lg mb-1">Astellic</p>
          <p className="text-base uppercase tracking-widest text-brand-gold mb-3">
            Research · Advisory · Implementation
          </p>
          <p className="text-base leading-relaxed">
            Working at the intersection of evidence, policy, and delivery across
            Africa.
          </p>
        </div>

        <div>
          <p className="text-white text-base font-semibold mb-3">Navigation</p>
          <ul className="space-y-2 text-base">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-white text-base font-semibold mb-3">Contact</p>
          <p className="text-base">
            <a
              href="mailto:partnerships@astellic.com"
              className="hover:text-white transition-colors"
            >
              partnerships@astellic.com
            </a>
          </p>
          <p className="text-base mt-1">Malawi / Pan-African</p>
        </div>
      </div>

      <div className="border-t border-white/10 text-center py-4 text-base text-gray-600 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span>© {new Date().getFullYear()} Astellic. All rights reserved.</span>
        <span className="hidden sm:inline text-gray-700">·</span>
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
