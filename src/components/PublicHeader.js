"use client";

import Link from "next/link";
import { IconUser } from "./Icons";
import { useAuth } from "@/lib/auth";
import { COLLEGE } from "@/lib/config";

/**
 * Header for the public archive ("/") - the full official letterhead a
 * government or college site carries: trust name, college name, former
 * name, postal address and accreditation line, all left-aligned beside the
 * crest. It is deliberately not sticky - it is tall, and PublicNav (search
 * + tabs) carries the sticky role instead so quick access survives without
 * this block eating the viewport on every scroll.
 */
export default function PublicHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-black/6 bg-white">
      <div className="mx-auto grid max-w-[1800px] grid-cols-[auto_1fr] items-start gap-3 px-3 py-3 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="shrink-0 justify-self-start">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-white p-1 ring-1 ring-black/10 sm:h-16 sm:w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={COLLEGE.logo} alt="" className="h-full w-full object-contain" />
          </span>
        </Link>

        <Link href="/" className="min-w-0 justify-self-start text-left leading-tight">
          <span className="block text-[11px] font-bold text-[#b3401d] sm:text-base">
            {COLLEGE.trust}&apos;s
          </span>
          <span className="block text-balance text-base font-extrabold leading-tight tracking-tight text-[#5c1310] sm:text-[28px]">
            {COLLEGE.name}, {COLLEGE.city}
          </span>
          <span className="mt-0.5 block text-[10px] font-bold text-[#1b3a8a] sm:text-sm">
            Formerly: {COLLEGE.formerName}
          </span>
          <span className="block text-[10px] font-bold text-[#b3401d] sm:text-sm">
            Tq. {COLLEGE.taluka}, District: {COLLEGE.district}, State: {COLLEGE.state}, Pin
            Code: {COLLEGE.pinCode}
          </span>
          <span className="mt-0.5 block text-[9px] font-semibold italic text-[#1b3a8a] sm:text-[13px]">
            [Est. {COLLEGE.established} ◊ Affiliated to {COLLEGE.affiliation} ◊ Accredited by
            NAAC with {COLLEGE.naacGrade} ◊ Accorded UGC {COLLEGE.ugcStatus} Status]
          </span>
        </Link>

        <div className="col-span-2 flex shrink-0 items-center justify-end gap-2 sm:col-span-1 sm:justify-self-end">
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
