"use client";

import { useEffect, useState } from "react";
import SaveToBoardMenu from "./SaveToBoardMenu";
import { Button } from "./ui";
import { IconClose, IconDownload, IconTrash, IconFolder, Spinner } from "./Icons";
import { useToast } from "./Toast";
import { largeUrl, downloadImage } from "@/lib/images";

function formatDate(value) {
  if (!value) return "";
  const ms = typeof value === "number" ? value : value?.toMillis?.() ?? Date.parse(value);
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Lightbox({ post, boardsById, onClose, onDelete }) {
  const { toast, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!post) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [post, onClose]);

  if (!post) return null;

  const boardNames = (post.boardIds || [])
    .map((id) => boardsById?.[id]?.name)
    .filter(Boolean);

  async function handleDownload() {
    if (saving) return;
    setSaving(true);
    const ok = await downloadImage(post.imageUrl, post.title);
    setSaving(false);
    if (ok) toast("Saved to your device.");
    else toastError("Opened in a new tab — long-press or right-click to save.");
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6">
      <div
        className="animate-fade absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:right-5 sm:top-5"
      >
        <IconClose />
      </button>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={post.title || "Newspaper cutting"}
        className="animate-sheet relative flex max-h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white sm:max-h-[88dvh] sm:flex-row sm:rounded-3xl sm:shadow-2xl"
      >
        <div className="flex min-h-0 flex-1 items-center justify-center bg-black/[0.04] p-2 sm:p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={largeUrl(post.imageUrl)}
            alt={post.title || "Newspaper cutting"}
            className="max-h-[52dvh] w-auto max-w-full rounded-xl object-contain shadow-sm sm:max-h-[78dvh]"
          />
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-black/6 p-5 pb-safe sm:w-80 sm:border-l sm:border-t-0 sm:pb-5">
          <div>
            <h2 className="text-lg font-bold leading-snug tracking-tight text-ink-900">
              {post.title || "Untitled cutting"}
            </h2>
            {post.note && (
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{post.note}</p>
            )}
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
              {post.source && <span className="font-semibold text-ink-700">{post.source}</span>}
              {post.source && formatDate(post.createdAt) && <span>·</span>}
              {formatDate(post.createdAt) && <span>Added {formatDate(post.createdAt)}</span>}
            </p>
          </div>

          {boardNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {boardNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/6 px-2.5 py-1 text-xs font-medium text-ink-700"
                >
                  <IconFolder className="h-3.5 w-3.5" />
                  {name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto space-y-2.5">
            <div className="flex items-center gap-2">
              <SaveToBoardMenu post={post} variant="soft" align="left" />
              <Button onClick={handleDownload} className="flex-1" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4" /> : <IconDownload className="h-4.5 w-4.5" />}
                Download
              </Button>
            </div>

            <button
              type="button"
              onClick={() => onDelete(post)}
              className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              <IconTrash className="h-4.5 w-4.5" />
              Delete cutting
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
