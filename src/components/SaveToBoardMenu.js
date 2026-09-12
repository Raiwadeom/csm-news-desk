"use client";

import { useState } from "react";
import { Modal, Button } from "./ui";
import { IconCheck, IconPlus, IconChevronDown, IconFolder } from "./Icons";
import { useToast } from "./Toast";
import { useApp } from "@/lib/app-context";
import { setPostBoard } from "@/lib/store";

/**
 * Pinterest's "Save" control: tick a collection to put this cutting in it,
 * untick to take it out. The cutting always stays in the main feed.
 *
 * This is a dialog rather than a dropdown on purpose. A grid card is about
 * 175px wide on a phone and is clipped to its own rounded corners, so an
 * anchored panel was both cut off and partly off-screen. A dialog is the
 * same size everywhere and cannot be clipped by whatever it sits inside.
 */
export default function SaveToBoardMenu({ post, variant = "solid" }) {
  const { boards, openCreateBoard } = useApp();
  const { toast, error: toastError } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(null);

  const saved = post.boardIds || [];
  const label = saved.length ? `Saved · ${saved.length}` : "Save";

  async function toggle(board) {
    const isIn = saved.includes(board.id);
    setPending(board.id);
    try {
      await setPostBoard(post.id, board.id, !isIn);
      toast(isIn ? `Removed from ${board.name}.` : `Saved to ${board.name}.`);
    } catch (err) {
      toastError(err.message || "Could not update the collection.");
    }
    setPending(null);
  }

  return (
    // The card this sits on opens the full-screen view when clicked, and a
    // dialog rendered here is still its React descendant - so every click
    // inside stops here rather than bubbling up and opening the lightbox.
    <span onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={
          variant === "solid"
            ? "inline-flex items-center gap-1 rounded-full bg-brand-600 px-3.5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-brand-700"
            : "inline-flex items-center gap-1.5 rounded-full bg-black/6 px-3.5 py-2 text-sm font-semibold text-ink-900 transition hover:bg-black/10"
        }
      >
        {label}
        <IconChevronDown className="h-4 w-4" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Save to collection"
        subtitle={post.title || "Tick a collection to add this cutting to it."}
        size="sm"
        elevated
        footer={
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        {boards.length === 0 ? (
          <p className="py-2 text-[15px] text-ink-500">
            No collections yet. Create one to start grouping cuttings by event.
          </p>
        ) : (
          <ul className="-mx-1 space-y-0.5">
            {boards.map((board) => {
              const isIn = saved.includes(board.id);
              return (
                <li key={board.id}>
                  <button
                    type="button"
                    onClick={() => toggle(board)}
                    disabled={pending === board.id}
                    aria-pressed={isIn}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-black/5 disabled:opacity-60"
                  >
                    <IconFolder className="h-4.5 w-4.5 shrink-0 text-ink-500" />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink-900">
                      {board.name}
                    </span>
                    {isIn && (
                      <IconCheck className="h-4.5 w-4.5 shrink-0 text-brand-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-2 border-t border-black/6 pt-2">
          <button
            type="button"
            onClick={() => {
              // Close first, or this dialog would sit behind the new one.
              setOpen(false);
              openCreateBoard();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-ink-900 transition hover:bg-black/5"
          >
            <IconPlus className="h-4.5 w-4.5 shrink-0 text-ink-500" />
            Create collection
          </button>
        </div>
      </Modal>
    </span>
  );
}
