"use client";

import { useMemo, useState } from "react";
import PinBrowser from "@/components/PinBrowser";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui";
import { IconUpload, IconFolder, IconImage, IconAlert } from "@/components/Icons";
import { useApp } from "@/lib/app-context";

export default function FeedPage() {
  const { posts, boards, ready, dataError, query, openUpload, openCreateBoard } =
    useApp();
  const [filter, setFilter] = useState("all");

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (filter !== "all" && !(post.boardIds || []).includes(filter)) return false;
      if (!q) return true;
      const boardNames = (post.boardIds || [])
        .map((id) => boardsById[id]?.name || "")
        .join(" ");
      return `${post.title} ${post.note} ${post.source} ${boardNames}`
        .toLowerCase()
        .includes(q);
    });
  }, [posts, filter, query, boardsById]);

  const isEmpty = ready && posts.length === 0;
  const noMatches = ready && posts.length > 0 && visible.length === 0;

  return (
    <div>
      {dataError && (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700"
        >
          <IconAlert className="mt-px h-4.5 w-4.5 shrink-0" />
          <span>{dataError}</span>
        </p>
      )}

      {/* filter rail */}
      {boards.length > 0 && (
        <div className="no-scrollbar -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:-mx-5 sm:px-5">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            All cuttings
          </Chip>
          {boards.map((board) => (
            <Chip
              key={board.id}
              active={filter === board.id}
              onClick={() => setFilter(board.id)}
            >
              {board.name}
            </Chip>
          ))}
        </div>
      )}

      {query && ready && (
        <p className="mb-3 text-sm text-ink-500">
          {visible.length} result{visible.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-ink-900">“{query}”</span>
        </p>
      )}

      {!ready && <SkeletonGrid />}

      {ready && visible.length > 0 && (
        <PinBrowser posts={visible} boardsById={boardsById} />
      )}

      {noMatches && (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title="Nothing matches that search"
          body="Try a different headline, newspaper name or collection."
        />
      )}

      {isEmpty && (
        <EmptyState
          icon={<IconUpload className="h-7 w-7" />}
          title="The archive is empty"
          body="Upload your first newspaper cutting to start the archive, or create a collection to sort them into."
          actions={
            <>
              <Button onClick={() => openUpload()}>
                <IconUpload className="h-4.5 w-4.5" />
                Upload cuttings
              </Button>
              <Button variant="outline" onClick={openCreateBoard}>
                <IconFolder className="h-4.5 w-4.5" />
                Create a board
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

function Chip({ active, children, ...rest }) {
  return (
    <button
      type="button"
      {...rest}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-ink-900 text-white" : "bg-black/6 text-ink-700 hover:bg-black/10"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonGrid() {
  const heights = [220, 320, 180, 280, 240, 340, 200, 300, 260, 190, 310, 230];
  return (
    <div className="masonry columns-2 sm:columns-3 md:columns-4 lg:columns-5 2xl:columns-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-black/6"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}
