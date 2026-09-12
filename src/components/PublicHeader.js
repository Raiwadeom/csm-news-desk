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
        natural width and the middle column takes whatever is left.

        The college name is far too long to fit on one phone-width line, so
        below `sm` it is left-aligned beside the logo and allowed to wrap
        onto two balanced lines - the header grows to suit. Truncating it to
        "Chhatrapati Shivajira…" is what made it look broken. From `sm` up
        there is room for one centred line again.
      */}
      <div className="mx-auto grid max-w-[1800px] grid-cols-[auto_1fr_auto] items-center gap-2.5 px-3 py-2.5 sm:h-20 sm:gap-3 sm:px-6 sm:py-0">
        <Link href="/" className="shrink-0 justify-self-start">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white p-0.5 ring-1 ring-black/8 sm:h-10 sm:w-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={COLLEGE.logo} alt="" className="h-full w-full object-contain" />
          </span>
        </Link>

        <Link
          href="/"
          className="min-w-0 justify-self-start text-left leading-tight sm:justify-self-center sm:text-center"
        >
          <span className="block text-balance text-[13px] font-extrabold tracking-tight text-ink-900 sm:truncate sm:text-xl">
            {COLLEGE.name}
          </span>
          <span className="mt-0.5 block text-[10.5px] text-ink-500 sm:mt-0 sm:truncate sm:text-sm">
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
