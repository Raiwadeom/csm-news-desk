"use client";

import { useEffect, useState } from "react";
import { registerVisit, subscribeVisitorCount } from "@/lib/store";
import { isFirebaseConfigured } from "@/lib/config";
import { IconEye } from "./Icons";

/**
 * A small pill in the footer showing the site's running visit count. Ticks
 * the shared tally once on mount (each page load counts as a visit) and
 * then just watches the live total, so every open tab stays in sync.
 */
export default function VisitorCounter({ className = "" }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    registerVisit().catch(() => {});
    return subscribeVisitorCount(setCount);
  }, []);

  if (count === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-ink-600 ${className}`}
    >
      <IconEye className="h-3.5 w-3.5 shrink-0 text-ink-500" />
      <span className="font-semibold tabular-nums">{count.toLocaleString()}</span>
      <span className="text-ink-500">{count === 1 ? "visit" : "visits"}</span>
    </span>
  );
}
