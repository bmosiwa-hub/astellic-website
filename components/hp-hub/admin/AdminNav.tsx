"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export interface NavItem {
  href: string;
  label: string;
  badge?: number;
}

export default function AdminNav({ items, user }: { items: NavItem[]; user: { name: string; role: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/hp-hub/admin" ? pathname === href : pathname.startsWith(href));

  const list = (
    <ul className="space-y-0.5">
      {items.map((i) => (
        <li key={i.href}>
          <Link
            href={i.href}
            onClick={() => setOpen(false)}
            aria-current={isActive(i.href) ? "page" : undefined}
            className={`flex items-center justify-between gap-3 rounded px-3 py-2 text-sm transition-colors ${
              isActive(i.href) ? "bg-white/10 text-white font-semibold" : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {i.label}
            {!!i.badge && <span className="text-[11px] font-bold bg-brand-gold text-brand-navy rounded-full px-1.5 min-w-5 text-center">{i.badge}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );

  const footer = (
    <div className="border-t border-white/10 pt-4 mt-6">
      <p className="text-sm text-white font-semibold truncate">{user.name}</p>
      <p className="text-xs text-gray-400">{user.role}</p>
      <div className="flex gap-4 mt-3 text-xs">
        <Link href="/hp-hub/admin/account" className="text-gray-300 hover:text-white">
          Account
        </Link>
        <Link href="/hp-hub" className="text-gray-300 hover:text-white" target="_blank">
          View site ↗
        </Link>
        <button type="button" onClick={() => signOut({ callbackUrl: "/hp-hub/admin/login" })} className="text-gray-300 hover:text-white">
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-brand-navy text-white px-4 h-14 sticky top-0 z-40">
        <Link href="/hp-hub/admin" className="font-bold">
          HP-Hub Admin
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="hp-admin-nav" className="text-sm font-semibold px-3 py-1.5 rounded border border-white/20">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="hp-admin-nav" aria-label="Admin" className="lg:hidden bg-brand-navy px-4 pb-6 pt-2 sticky top-14 z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          {list}
          {footer}
        </nav>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 bg-brand-navy px-4 py-6 sticky top-0 h-screen overflow-y-auto">
        <Link href="/hp-hub/admin" className="px-3 mb-6 block">
          <span className="block text-white font-bold">HP-Hub Admin</span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-brand-gold mt-0.5">Astellic</span>
        </Link>
        <nav aria-label="Admin" className="flex-1">
          {list}
        </nav>
        {footer}
      </aside>
    </>
  );
}
