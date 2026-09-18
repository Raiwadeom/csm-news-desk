"use client";

import { useEffect, useState } from "react";
import { registerVisit, subscribeVisitorCount } from "@/lib/store";
import { isFirebaseConfigured } from "@/lib/config";
import { IconEye } from "./Icons";

/**
 * The footer's visit counter, styled like the digital odometer widget on
 * government and college sites - a labelled card with each digit in its
 * own dark LED tile, rather than a plain number. Ticks the shared tally
 * once on mount (each page load counts as a visit) and then just watches
 * the live total, so every open tab stays in sync.
 */
export default function VisitorCounter({ className = "" }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    registerVisit().catch(() => {});
    return subscribeVisitorCount(setCount);
  }, []);

  if (count === null) return null;

  const digits = String(count).padStart(6, "0").split("");

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border border-black/15 bg-white px-2.5 py-1.5 shadow-sm ${className}`}
    >
      <IconEye className="h-4 w-4 shrink-0 text-brand-700" />
      <span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-ink-700">
        Total
        <br />
        Visitors
      </span>
      <div className="flex gap-[2px] rounded bg-ink-900 p-1">
        {digits.map((digit, i) => (
          <span
            key={i}
            className="flex h-4 w-3 items-center justify-center font-mono text-[11px] font-bold leading-none text-amber-400"
          >
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
}
