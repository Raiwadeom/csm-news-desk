"use client";

import { useMemo } from "react";
import ArchiveBrowser, { ArchiveSearch } from "@/components/ArchiveBrowser";
import EmptyState from "@/components/EmptyState";
import SkeletonGrid from "@/components/SkeletonGrid";
import BoardCard from "@/components/BoardCard";
import { IconImage, IconAlert, IconFolder } from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterPosts, filterBoards } from "@/lib/search";

/**
 * The front door of the archive: every published cutting in one grid, the
 * ones inside collections included. Searching here looks at the collection
 * names too, so "shivjayanti" finds every Shivjayanti cutting and
 * "shivjayanti 2026" narrows to the one year.
 */
export default function PublicFeedPage() {
  const { posts, boards, boardStats, ready, dataError, query, setQuery } = useApp();

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  // The search runs first; the sidebar's ticks then narrow what it left, so
  // the panel's counts always describe the current search.
  const searched = useMemo(
    () => filterPosts(posts, query, boardsById),
    [posts, query, boardsById]
  );

  // Collections whose own name matches - offered as a shortcut above the
  // results, so a search for an event leads to the whole set of it.
  const matchingBoards = useMemo(
    () => (query.trim() ? filterBoards(boards, query) : []),
    [boards, query]
  );

  const isEmpty = ready && posts.length === 0;

  return (
    <div>
      <div className="mb-4 border-l-4 border-[#b91c1c] pl-3">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1f2937] sm:text-3xl">
          Newspaper Archive
        </h1>
      </div>

      <ArchiveSearch query={query} setQuery={setQuery} className="mb-6" />

      {dataError && (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700"
        >
          <IconAlert className="mt-px h-4.5 w-4.5 shrink-0" />
          <span>{dataError}</span>
        </p>
      )}

      {matchingBoards.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-ink-700">
            <IconFolder className="h-4 w-4" />
            {matchingBoards.length === 1 ? "Matching collection" : "Matching collections"}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {matchingBoards.slice(0, 5).map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                stats={boardStats[board.id]}
                href={`/collection/${board.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {!ready && <SkeletonGrid />}

      {ready && posts.length > 0 && (
        <ArchiveBrowser
          posts={searched}
          total={posts.length}
          boards={boards}
          boardsById={boardsById}
          query={query}
          readOnly
        />
      )}

      {isEmpty && (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title="The archive is empty"
          body="Newspaper cuttings uploaded by the college administrators will appear here."
        />
      )}
    </div>
  );
}
