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
            The counter card is wide (label + six LED digits), so it can't
            share a row with the full college name on a phone without
            squeezing it into a ragged 3-line wrap. On a phone the credit
            text gets its own full-width centered row, with the counter on
            a second row pinned right. From sm up it switches to a
            3-column grid (spacer / credit / counter) putting them back on
            one line, credit dead-center, counter still on the right.
          */}
          <div className="mx-auto flex max-w-[1800px] flex-col gap-3 text-xs sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="hidden sm:block" aria-hidden="true" />
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-ink-500">
                {COLLEGE.name}, {COLLEGE.city}
              </p>
              <BuiltBy className="text-[13px]" />
            </div>
            <div className="flex justify-end">
              <VisitorCounter className="text-[11px]" />
            </div>
          </div>
        </footer>
      </div>
    </AppDataProvider>
  );
}
