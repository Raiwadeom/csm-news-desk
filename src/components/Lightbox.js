"use client";

import { useEffect, useState } from "react";
import SaveToBoardMenu from "./SaveToBoardMenu";
import { Button } from "./ui";
import { IconClose, IconDownload, IconTrash, IconFolder, IconEdit, IconCheck, Spinner } from "./Icons";
import { useToast } from "./Toast";
import { largeUrl, downloadImage } from "@/lib/images";
import { formatNewsDate } from "@/lib/dates";
import { updatePost } from "@/lib/store";
import { lockBodyScroll } from "@/lib/scroll-lock";

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

export default function Lightbox({ post, boardsById, onClose, onDelete, readOnly = false }) {
  const { toast, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState("");
  const [savingDate, setSavingDate] = useState(false);

  useEffect(() => {
    setEditingDate(false);
  }, [post?.id]);

  const isOpen = Boolean(post);

  useEffect(() => {
    if (!isOpen) return;
    return lockBodyScroll();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

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

  function startEditDate() {
    setDateDraft(post.newsDate || "");
    setEditingDate(true);
  }

  async function handleSaveDate() {
    setSavingDate(true);
    try {
      await updatePost(post.id, { newsDate: dateDraft || null });
      toast("Publication date updated.");
      setEditingDate(false);
    } catch (err) {
      toastError(err.message || "Could not update the date.");
    }
    setSavingDate(false);
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
        className="animate-sheet relative flex max-h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white sm:max-h-[88dvh] sm:flex-row sm:rounded-lg sm:border sm:border-black/10 sm:shadow-2xl"
      >
        <div className="flex min-h-0 flex-1 items-center justify-center bg-black/[0.04] p-2 sm:p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={largeUrl(post.imageUrl)}
            alt={post.title || "Newspaper cutting"}
            className="max-h-[52dvh] w-auto max-w-full rounded-md border border-black/10 object-contain shadow-sm sm:max-h-[78dvh]"
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

            <div className="mt-3 divide-y divide-black/8 rounded-md border border-black/10 bg-black/[0.02] text-xs">
              {post.source && (
                <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                  <span className="font-bold uppercase tracking-wide text-ink-500">Source</span>
                  <span className="font-semibold text-ink-900">{post.source}</span>
                </div>
              )}
              {!readOnly && formatDate(post.createdAt) && (
                <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                  <span className="font-bold uppercase tracking-wide text-ink-500">Added</span>
                  <span className="text-ink-700">{formatDate(post.createdAt)}</span>
                </div>
              )}
              {(post.newsDate || !readOnly) && (
                <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                  <span className="font-bold uppercase tracking-wide text-ink-500">Published</span>
                  {editingDate ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        value={dateDraft}
                        onChange={(e) => setDateDraft(e.target.value)}
                        autoFocus
                        className="rounded border border-black/12 bg-white px-2 py-1 text-xs outline-none focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDate}
                        disabled={savingDate}
                        aria-label="Save date"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-60"
                      >
                        {savingDate ? <Spinner className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDate(false)}
                        disabled={savingDate}
                        aria-label="Cancel"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-500 transition hover:bg-black/6"
                      >
                        <IconClose className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 font-bold text-[#5c1310]">
                      {post.newsDate ? formatNewsDate(post.newsDate) : "Not set"}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={startEditDate}
                          aria-label="Edit publication date"
                          className="rounded-full p-1 text-ink-500 transition hover:bg-black/6 hover:text-ink-900"
                        >
                          <IconEdit className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {boardNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {boardNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-[#5c1310]/25 bg-[#5c1310]/5 px-2.5 py-1 text-xs font-semibold text-[#5c1310]"
                >
                  <IconFolder className="h-3.5 w-3.5" />
                  {name}
                </span>
              ))}
            </div>
          )}

          {!readOnly && (
            <div className="mt-auto space-y-2.5">
              <div className="flex items-center gap-2">
                <SaveToBoardMenu post={post} variant="soft" />
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
          )}
        </aside>
      </div>
    </div>
  );
}
