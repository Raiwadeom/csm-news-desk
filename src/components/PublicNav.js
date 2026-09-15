"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearch, IconClose, IconHome, IconGrid } from "./Icons";
import { useApp } from "@/lib/app-context";

const TABS = [
  { href: "/", label: "Main feed", icon: IconHome },
  { href: "/collection", label: "Collections", icon: IconGrid },
];

/**
 * The two ways into the public archive - everything at once, or grouped by
 * collection - with the search box that belongs to whichever one is open.
 */
export default function PublicNav() {
  const pathname = usePathname();
  const { query, setQuery } = useApp();

  const onCollections = pathname.startsWith("/collection");
  const insideOneCollection = onCollections && pathname !== "/collection";

  // The phrase is deliberately kept when the visitor switches view. Both
  // views search the same vocabulary - a cutting is searched by the names
  // of the collections it sits in - so "shivjayanti" typed on the
  // Collections tab still means something on the feed, and the other way
  // round.

  // Kept short enough not to be clipped in the box at phone width; the
  // empty states carry the longer "here is what you can type" copy.
  const placeholder = insideOneCollection
    ? "Search in this collection…"
    : onCollections
      ? "Search collections…"
      : "Search cuttings, dates, events…";

  return (
    <div className="border-b border-black/6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <nav className="flex shrink-0 gap-1.5" aria-label="Archive views">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition sm:text-[15px] ${
                  active
                    ? "bg-ink-900 text-white"
                    : "bg-black/6 text-ink-700 hover:bg-black/10"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative min-w-0 sm:max-w-md sm:flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full rounded-full border border-transparent bg-black/6 py-2.5 pl-10 pr-9 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/12"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-500 transition hover:bg-black/8 hover:text-ink-900"
            >
              <IconClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
