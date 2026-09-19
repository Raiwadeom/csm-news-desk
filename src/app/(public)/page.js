"use client";

import { useMemo } from "react";
import Link from "next/link";
import PinBrowser from "@/components/PinBrowser";
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
  const { posts, boards, boardStats, ready, dataError, query } = useApp();

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  const visible = useMemo(
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
  const noMatches = ready && posts.length > 0 && visible.length === 0;

  return (
    <div>
      <div className="mb-5 border-l-4 border-[#5c1310] pl-3">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#5c1310] sm:text-3xl">
          Newspaper Archive
        </h1>
      </div>

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

      {query.trim() && ready && visible.length > 0 && (
        <p className="mb-3 text-sm text-ink-500">
          {visible.length} cutting{visible.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-ink-900">“{query.trim()}”</span>
        </p>
      )}

      {!ready && <SkeletonGrid />}

      {ready && visible.length > 0 && (
        <PinBrowser posts={visible} boardsById={boardsById} readOnly />
      )}

      {noMatches && (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title="Nothing matches that search"
          body="Try a headline, a newspaper name, the name of a collection such as “Shivjayanti”, or the date it was published — 2/2/2021 works, and so does 2 Feb 2021."
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
