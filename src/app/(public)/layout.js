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
          <div className="mx-auto flex max-w-[1800px] flex-col items-center gap-1.5 text-center text-xs">
            <p className="text-ink-500">
              {COLLEGE.name}, {COLLEGE.city}
            </p>
            <VisitorCounter className="text-[11px]" />
            <BuiltBy className="text-[13px]" />
          </div>
        </footer>
      </div>
    </AppDataProvider>
  );
}
