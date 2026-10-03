"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconGrid } from "./Icons";

const TABS = [
  { href: "/", label: "Main feed", icon: IconHome },
  { href: "/collection", label: "Collections", icon: IconGrid },
];

/**
 * The two ways into the public archive - everything at once, or grouped by
 * collection. Each page carries its own full-width search under its heading.
 */
export default function PublicNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-50 border-b border-black/6 bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <nav className="flex shrink-0 gap-1.5" aria-label="Archive views">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-sm border px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition sm:text-[13px] ${
                  active
                    ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                    : "border-black/15 bg-white text-brand-700 hover:bg-brand-700/8"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
