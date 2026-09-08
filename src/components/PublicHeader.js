"use client";

import Link from "next/link";
import { IconUser } from "./Icons";
import { useAuth } from "@/lib/auth";
import { COLLEGE } from "@/lib/config";

/**
 * Header for the public archive ("/"). Just the college identity, centred,
 * and a single link into the admin side (sign-in, or straight to the
 * dashboard for an admin who is already signed in). No search, no
 * download-adjacent controls - those stay admin-only.
 */
export default function PublicHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/6 bg-white/92 backdrop-blur-md">
      {/*
        grid-cols-[auto_1fr_auto]: the logo and the sign-in link keep their
        natural width, and the middle column takes whatever is left - the
        `1fr` (not `auto`) is what lets the name actually shrink and
        truncate on a narrow screen instead of overflowing past its column.
      */}
      <div className="mx-auto grid h-16 max-w-[1800px] grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6">
        <Link href="/" className="shrink-0 justify-self-start">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white p-0.5 ring-1 ring-black/8 sm:h-10 sm:w-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={COLLEGE.logo} alt="" className="h-full w-full object-contain" />
          </span>
        </Link>

        <Link href="/" className="min-w-0 justify-self-center text-center leading-tight">
          <span className="block truncate text-[15px] font-extrabold tracking-tight text-ink-900 sm:text-xl">
            {COLLEGE.name}
          </span>
          <span className="block truncate text-[11px] text-ink-500 sm:text-sm">
            {COLLEGE.city} · News Desk
          </span>
        </Link>

        <div className="shrink-0 justify-self-end">
          {!loading && (
            <Link
              href={user ? "/feed" : "/login"}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black sm:px-4 sm:py-2.5"
            >
              <IconUser className="h-4 w-4" />
              <span className="hidden sm:inline">
                {user ? "Admin dashboard" : "Admin sign in"}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
