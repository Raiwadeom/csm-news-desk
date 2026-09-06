"use client";

import { Dropdown, MenuItem } from "./ui";
import { IconCheck, IconPlus, IconChevronDown, IconFolder } from "./Icons";
import { useToast } from "./Toast";
import { useApp } from "@/lib/app-context";
import { setPostBoard } from "@/lib/store";

/**
 * Pinterest's "Save" control: tick a collection to put this cutting in it,
 * untick to take it out. The cutting always stays in the main feed.
 */
export default function SaveToBoardMenu({ post, variant = "solid", align = "right" }) {
  const { boards, openCreateBoard } = useApp();
  const { toast, error: toastError } = useToast();
  const saved = post.boardIds || [];

  async function toggle(board) {
    const isIn = saved.includes(board.id);
    try {
      await setPostBoard(post.id, board.id, !isIn);
      toast(isIn ? `Removed from ${board.name}.` : `Saved to ${board.name}.`);
    } catch (err) {
      toastError(err.message || "Could not update the collection.");
    }
  }

  const label = saved.length ? `Saved · ${saved.length}` : "Save";

  return (
    <Dropdown
      align={align}
      button={({ toggle: openMenu }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openMenu();
          }}
          className={
            variant === "solid"
              ? "inline-flex items-center gap-1 rounded-full bg-brand-600 px-3.5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-brand-700"
              : "inline-flex items-center gap-1.5 rounded-full bg-black/6 px-3.5 py-2 text-sm font-semibold text-ink-900 transition hover:bg-black/10"
          }
        >
          {label}
          <IconChevronDown className="h-4 w-4" />
        </button>
      )}
    >
      <p className="px-3 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
        Save to collection
      </p>

      <div className="max-h-64 overflow-y-auto">
        {boards.length === 0 && (
          <p className="px-3 py-2 text-sm text-ink-500">No collections yet.</p>
        )}
        {boards.map((board) => {
          const isIn = saved.includes(board.id);
          return (
            <MenuItem
              key={board.id}
              icon={<IconFolder className="h-4.5 w-4.5" />}
              onClick={(e) => {
                e.stopPropagation();
                toggle(board);
              }}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate">{board.name}</span>
                {isIn && <IconCheck className="h-4.5 w-4.5 shrink-0 text-brand-600" />}
              </span>
            </MenuItem>
          );
        })}
      </div>

      <div className="mt-1 border-t border-black/6 pt-1">
        <MenuItem
          icon={<IconPlus className="h-4.5 w-4.5" />}
          onClick={(e) => {
            e.stopPropagation();
            openCreateBoard();
          }}
        >
          Create collection
        </MenuItem>
      </div>
    </Dropdown>
  );
}
