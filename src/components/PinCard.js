"use client";

import { useState } from "react";
import SaveToBoardMenu from "./SaveToBoardMenu";
import { IconDownload, IconFolder, Spinner } from "./Icons";
import { useToast } from "./Toast";
import { thumbUrl, downloadImage } from "@/lib/images";
import { formatNewsDate } from "@/lib/dates";

export default function PinCard({ post, onOpen, boardsById, readOnly = false }) {
  const { toast, error: toastError } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const ratio = `${post.width || 800} / ${post.height || 1000}`;
  const inBoards = (post.boardIds || [])
    .map((id) => boardsById?.[id]?.name)
    .filter(Boolean);

  async function handleDownload(e) {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    const ok = await downloadImage(post.imageUrl, post.title);
    setSaving(false);
    if (ok) toast("Saved to your device.");
    else toastError("Opened in a new tab — long-press or right-click to save.");
  }

  return (
    <figure className="group animate-pop">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(post)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(post);
          }
        }}
        className="relative w-full cursor-zoom-in overflow-hidden rounded-2xl bg-black/5 outline-none ring-brand-500/40 focus-visible:ring-4"
        style={{ aspectRatio: ratio }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          // A cached or data-URL image can finish before React attaches
          // onLoad, so the ref checks `complete` as well - otherwise the
          // card would stay blank behind a permanently transparent image.
          ref={(el) => {
            if (el?.complete) setLoaded(true);
          }}
          src={thumbUrl(post.imageUrl, 700)}
          alt={post.title || "Newspaper cutting"}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* dim layer on hover (desktop only) */}
        <div className="pointer-events-none absolute inset-0 hidden bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block" />

        {/* action layer: always visible on touch, on hover for pointer devices */}
        <div className="absolute inset-0 flex flex-col justify-between p-2.5 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
          <div className="flex justify-end">
            {!readOnly && <SaveToBoardMenu post={post} />}
          </div>

          <div className="flex items-end justify-between gap-2">
            {post.source ? (
              <span className="max-w-[60%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {post.source}
              </span>
            ) : (
              <span />
            )}

            {!readOnly && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label="Download this cutting"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink-900 shadow-md transition hover:bg-white"
                >
                  {saving ? <Spinner className="h-4 w-4" /> : <IconDownload className="h-4.5 w-4.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(post.title || inBoards.length > 0 || post.newsDate) && (
        <figcaption className="px-1 pt-2">
          {post.title && (
            <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink-900">
              {post.title}
            </p>
          )}
          {(inBoards.length > 0 || post.newsDate) && (
            <p className="mt-1 flex items-center gap-2 truncate text-[12px] text-ink-500">
              {post.newsDate && <span className="shrink-0">{formatNewsDate(post.newsDate)}</span>}
              {inBoards.length > 0 && (
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <IconFolder className="h-3.5 w-3.5 shrink-0" />
                  {inBoards.join(", ")}
                </span>
              )}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
