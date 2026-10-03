"use client";

import { useEffect, useState } from "react";
import { IconChevronDown } from "./Icons";

/**
 * A round arrow pinned bottom-right that scrolls back to the top. It only
 * appears once the visitor is a screen or so down the archive, where
 * scrolling back up by hand gets tedious. `className` lets the admin shell
 * lift it clear of its phone bottom bar.
 */
export default function BackToTop({ className = "bottom-5" }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={`fixed right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-[#b91c1c] text-white shadow-lg ring-2 ring-white transition duration-200 hover:bg-[#991b1b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b91c1c]/30 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      } ${className}`}
    >
      <IconChevronDown className="h-5 w-5 rotate-180" />
    </button>
  );
}
