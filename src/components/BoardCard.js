"use client";

import Link from "next/link";
import { IconEdit } from "./Icons";
import { thumbUrl } from "@/lib/images";

/**
 * One collection in a grid: a three-tile cover mosaic, the name and the pin
 * count. `onEdit` is admin-only - the public archive leaves it off.
 */
export default function BoardCard({ board, stats, href, onEdit }) {
  const covers = stats?.covers || [];
  const count = stats?.count || 0;

  return (
    <div className="group">
      <Link
        href={href}
        className="block overflow-hidden rounded-2xl bg-black/5 ring-brand-500/40 transition group-hover:brightness-[0.97] focus:outline-none focus-visible:ring-4"
      >
        {/* Cover tiles are positioned absolutely inside fixed-ratio boxes -
            a plain grid would let each image's intrinsic height stretch its
            row and spill out of the card. */}
        <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-0.5">
          <CoverTile post={covers[0]} width={400} className="col-span-2 row-span-2" />
          <CoverTile post={covers[1]} width={200} />
          <CoverTile post={covers[2]} width={200} />
        </div>
      </Link>

      <div className="mt-2 flex items-start gap-1.5 px-0.5">
        <div className="min-w-0 flex-1">
          <Link
            href={href}
            className="block truncate text-[15px] font-bold text-ink-900 hover:underline"
          >
            {board.name}
          </Link>
          <p className="truncate text-[13px] text-ink-500">
            {count} {count === 1 ? "pin" : "pins"}
            {board.description ? ` · ${board.description}` : ""}
          </p>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${board.name}`}
            className="shrink-0 rounded-full p-1.5 text-ink-500 opacity-0 transition hover:bg-black/6 hover:text-ink-900 focus:opacity-100 group-hover:opacity-100"
          >
            <IconEdit className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function CoverTile({ post, width, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-black/8 ${className}`}>
      {post && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbUrl(post.imageUrl, width)}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
