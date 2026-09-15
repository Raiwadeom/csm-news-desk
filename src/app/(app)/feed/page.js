"use client";

import { useMemo, useState } from "react";
import PinBrowser from "@/components/PinBrowser";
import EmptyState from "@/components/EmptyState";
import SkeletonGrid from "@/components/SkeletonGrid";
import { Button } from "@/components/ui";
import { IconUpload, IconFolder, IconImage, IconAlert, IconClose } from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterPosts, filterByDateRange } from "@/lib/search";

export default function FeedPage() {
  const { posts, boards, ready, dataError, query, openUpload, openCreateBoard } =
    useApp();
  const [filter, setFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  const hasRange = Boolean(dateFrom || dateTo);

  const visible = useMemo(() => {
    const inBoard =
      filter === "all"
        ? posts
        : posts.filter((post) => (post.boardIds || []).includes(filter));
    const inRange = filterByDateRange(inBoard, dateFrom, dateTo);
    return filterPosts(inRange, query, boardsById);
  }, [posts, filter, dateFrom, dateTo, query, boardsById]);

  const undated = useMemo(
    () => (hasRange ? posts.filter((p) => !p.newsDate).length : 0),
    [posts, hasRange]
  );

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

      {/* publication-date range */}
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-sm font-medium text-ink-700">Published between</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Published on or after"
          className="rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
        />
        <span className="text-sm text-ink-500">and</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="Published on or before"
          className="rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
        />
        {hasRange && (
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="inline-flex items-center gap-1 rounded-full bg-black/6 px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-black/10"
          >
            <IconClose className="h-3.5 w-3.5" />
            Clear dates
          </button>
        )}
        {hasRange && ready && (
          <span className="text-xs text-ink-500">
            {visible.length} in range
            {undated > 0 && ` · ${undated} cutting${undated === 1 ? "" : "s"} have no date set`}
          </span>
        )}
      </div>

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
