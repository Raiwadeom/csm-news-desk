"use client";

import PublicHeader from "@/components/PublicHeader";
import PublicNav from "@/components/PublicNav";
import BuiltBy from "@/components/BuiltBy";
import VisitorCounter from "@/components/VisitorCounter";
import { AppDataProvider } from "@/lib/app-context";
import { COLLEGE } from "@/lib/config";

/**
 * The public archive: the main feed, the collections index and each
 * collection's own page. No sign-in required for any of them - reading is
 * open to everyone, and every write stays behind /login.
 *
 * It shares AppDataProvider with the admin side so both are reading the
 * same two live lists (cuttings + collections) in the same shape.
 */
export default function PublicLayout({ children }) {
  return (
    <AppDataProvider>
      <div className="flex min-h-dvh flex-col bg-white">
        <PublicHeader />
        <PublicNav />
        {/*
          min-w-0 is load-bearing. The wrapper above is a flex column so the
          footer can sit at the bottom of a short page, which makes this a
          flex item - and a flex item defaults to min-width:auto, refusing to
          shrink below its content's min-content width. The masonry's
          min-content is two columns wide, so on a phone the page grew to
          410px inside a 375px viewport and scrolled sideways.
        */}
        <main className="mx-auto w-full min-w-0 max-w-[1800px] px-3 pb-12 pt-4 sm:px-5">
          {children}
        </main>

        <footer className="mt-auto border-t border-black/6 px-4 py-7">
          {/*
            On a phone this is a two-item row - credit lines on the left,
            the visitor pill pinned to the right via justify-between. From
            sm up it switches to a 3-column grid (spacer / credit / pill)
            so the credit lines can sit dead-center with the pill still on
            the right, instead of the pill fighting them for the same line.
          */}
          <div className="mx-auto flex max-w-[1800px] items-start justify-between gap-3 text-xs sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:text-center">
            <div className="hidden sm:block" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 text-left sm:flex-initial sm:items-center sm:text-center">
              <p className="text-ink-500">
                {COLLEGE.name}, {COLLEGE.city}
              </p>
              <BuiltBy className="text-[13px]" />
            </div>
            <VisitorCounter className="shrink-0 text-[11px] sm:justify-self-end" />
          </div>
        </footer>
      </div>
    </AppDataProvider>
  );
}
