"use client";

import { useEffect, useState } from "react";
import { registerVisit, subscribeVisitorCount } from "@/lib/store";
import { isFirebaseConfigured } from "@/lib/config";

/**
 * "N visits" in the footer. Ticks the shared tally once on mount (each page
 * load counts as a visit) and then just watches the live total, so every
 * open tab across every visitor stays in sync without a refresh.
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
    <p className={`text-ink-500 ${className}`}>
      {count.toLocaleString()} {count === 1 ? "visit" : "visits"}
    </p>
  );
}
