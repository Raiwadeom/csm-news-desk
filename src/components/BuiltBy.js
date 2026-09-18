"use client";

import { IconExternal } from "./Icons";
import { BUILDER } from "@/lib/config";

/**
 * "Built by <name>" — a link to the builder's portfolio, shown on the login
 * screen and at the foot of the public archive.
 *
 * `tone` picks the palette: "dark" for the red brand panel, "light" for the
 * white pages. Without a portfolio url in config the name still renders,
 * just not as a link, so this never shows a dead one.
 */
export default function BuiltBy({ tone = "light", className = "" }) {
  const dark = tone === "dark";

  const prefix = dark ? "text-white/70" : "text-ink-500";
  const nameStyle = dark
    ? "text-white decoration-white/45 hover:decoration-white"
    : "text-brand-700 decoration-brand-300 hover:text-brand-800 hover:decoration-brand-500";

  const name = (
    <span className="font-semibold">{BUILDER.name}</span>
  );

  return (
    <span className={`inline-flex flex-nowrap items-center justify-center gap-x-1.5 whitespace-nowrap ${prefix} ${className}`}>
      <span>Built by</span>
      {BUILDER.url ? (
        <a
          href={BUILDER.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 rounded underline decoration-1 underline-offset-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${nameStyle}`}
        >
          {name}
          <IconExternal className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : (
        <span className={dark ? "font-semibold text-white" : "font-semibold text-ink-700"}>
          {BUILDER.name}
        </span>
      )}
    </span>
  );
}
