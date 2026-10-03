"use client";

import { useMemo, useState } from "react";
import ArchiveBrowser, { ArchiveSearch } from "@/components/ArchiveBrowser";
import EmptyState from "@/components/EmptyState";
import SkeletonGrid from "@/components/SkeletonGrid";
import { Button } from "@/components/ui";
import { IconUpload, IconFolder, IconAlert, IconClose } from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterPosts, filterByDateRange } from "@/lib/search";

/**
 * The admin side of the archive. It browses exactly like the public page -
 * the same search box, filter sidebar and sort - plus a publication-date
 * range, and every cutting can be edited or deleted from its lightbox.
 */
export default function FeedPage() {
  const { posts, boards, ready, dataError, query, setQuery, openUpload, openCreateBoard } =
    useApp();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  const hasRange = Boolean(dateFrom || dateTo);

  const searched = useMemo(
    () => filterPosts(filterByDateRange(posts, dateFrom, dateTo), query, boardsById),
    [posts, dateFrom, dateTo, query, boardsById]
  );

  const undated = useMemo(
    () => (hasRange ? posts.filter((p) => !p.newsDate).length : 0),
    [posts, hasRange]
  );

  const isEmpty = ready && posts.length === 0;

  return (
    <div>
      <div className="mb-4 border-l-4 border-[#b91c1c] pl-3">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1f2937] sm:text-3xl">
          Newspaper Archive
        </h1>
      </div>

      <ArchiveSearch query={query} setQuery={setQuery} className="mb-3" />

      {dataError && (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700"
        >
          <IconAlert className="mt-px h-4.5 w-4.5 shrink-0" />
          <span>{dataError}</span>
        </p>
      )}

      {/* publication-date range */}
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-sm font-medium text-ink-700">Published between</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Published on or after"
          className="rounded-md border border-black/15 bg-white px-2.5 py-1.5 text-sm shadow-sm outline-none focus:border-[#b91c1c]"
        />
        <span className="text-sm text-ink-500">and</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="Published on or before"
          className="rounded-md border border-black/15 bg-white px-2.5 py-1.5 text-sm shadow-sm outline-none focus:border-[#b91c1c]"
        />
        {hasRange && (
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="inline-flex items-center gap-1 rounded-sm bg-[#fee2e2] px-2.5 py-1.5 text-xs font-semibold text-[#b91c1c] transition hover:bg-[#fecaca]"
          >
            <IconClose className="h-3.5 w-3.5" />
            Clear dates
          </button>
        )}
        {hasRange && ready && undated > 0 && (
          <span className="text-xs text-ink-500">
            {undated} cutting{undated === 1 ? " has" : "s have"} no date set
          </span>
        )}
      </div>

      {!ready && <SkeletonGrid />}

      {ready && posts.length > 0 && (
        <ArchiveBrowser
          posts={searched}
          total={posts.length}
          boards={boards}
          boardsById={boardsById}
          query={query}
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
