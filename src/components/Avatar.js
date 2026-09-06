"use client";

import { thumbUrl } from "@/lib/images";

// Titles are dropped so "Dr. S. R. Deshmukh" reads as SD, not DD.
const HONORIFICS = new Set([
  "dr", "prof", "mr", "mrs", "ms", "shri", "smt", "adv", "cs", "ca",
]);

function initials(name = "", email = "") {
  const source = name.trim() || email.split("@")[0] || "A";
  const parts = source
    .replace(/[^\p{L}\s.]/gu, " ")
    .split(/\s+/)
    .map((p) => p.replace(/\.$/, ""))
    .filter((p) => p && !HONORIFICS.has(p.toLowerCase()));

  if (parts.length === 0) return "A";
  const letters =
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

export default function Avatar({ profile, email = "", size = 40, className = "" }) {
  const src = profile?.photoUrl;
  const style = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbUrl(src, Math.max(96, size * 2))}
        alt={profile?.name ? `${profile.name}'s profile photo` : "Profile photo"}
        style={style}
        className={`shrink-0 rounded-full object-cover ring-1 ring-black/8 ${className}`}
      />
    );
  }

  return (
    <span
      style={{ ...style, fontSize: Math.max(11, size * 0.36) }}
      className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 font-bold text-white ring-1 ring-black/8 ${className}`}
      aria-hidden="true"
    >
      {initials(profile?.name, email)}
    </span>
  );
}
