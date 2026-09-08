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
      <div className="mx-auto grid h-20 max-w-[1800px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 justify-self-start">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white p-0.5 ring-1 ring-black/8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={COLLEGE.logo} alt="" className="h-full w-full object-contain" />
          </span>
        </Link>

        <Link href="/" className="min-w-0 justify-self-center text-center leading-tight">
          <span className="block truncate text-lg font-extrabold tracking-tight text-ink-900 sm:text-xl">
            {COLLEGE.name}
          </span>
          <span className="block text-[13px] text-ink-500 sm:text-sm">
            {COLLEGE.city} · News Desk
          </span>
        </Link>

        <div className="justify-self-end">
          {!loading && (
            <Link
              href={user ? "/feed" : "/login"}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-black sm:px-4"
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
