"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import BoardCard from "@/components/BoardCard";
import {
  ArchiveSearch,
  PageHeading,
  ResultsBar,
} from "@/components/ArchiveBrowser";
import { IconFolder, IconAlert, IconHome } from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterBoards, sortBoards, BOARD_SORT_OPTIONS } from "@/lib/search";

/**
 * The public index of collections. Searching here matches a collection's
 * name and description - "shivjayanti" brings up every Shivjayanti set,
 * "shivjayanti 2026" just the one.
 */
export default function PublicCollectionsPage() {
  const { boards, boardStats, ready, dataError, query, setQuery } = useApp();
  const [sort, setSort] = useState("newest");

  const visible = useMemo(
    () => sortBoards(filterBoards(boards, query), sort, boardStats),
    [boards, query, sort, boardStats],
  );

  const isEmpty = ready && boards.length === 0;
  const noMatches = ready && boards.length > 0 && visible.length === 0;

  return (
    <div>
      <PageHeading>Collections</PageHeading>

      <ArchiveSearch
        query={query}
        setQuery={setQuery}
        placeholder="Search collections by name or event"
        className="mb-6"
      />

      {dataError && (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          <IconAlert className="mt-px h-4.5 w-4.5 shrink-0" />
          <span>{dataError}</span>
        </p>
      )}

      {ready && boards.length > 0 && (
        <ResultsBar
          shown={visible.length}
          total={boards.length}
          noun="collections"
          query={query}
          sort={sort}
          setSort={setSort}
          options={BOARD_SORT_OPTIONS}
        />
      )}

      {!ready && <SkeletonBoards />}

      {ready && visible.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              stats={boardStats[board.id]}
              href={`/collection/${board.id}`}
            />
          ))}
        </div>
      )}

      {noMatches && (
        <EmptyState
          icon={<IconFolder className="h-7 w-7" />}
          title="No collection by that name"
          body="The main feed searches every cutting, not just the collection names — the same words may well find something there."
          actions={
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-800"
            >
              <IconHome className="h-4.5 w-4.5" />
              Search the main feed
            </Link>
          }
        />
      )}

      {isEmpty && (
        <EmptyState
          icon={<IconFolder className="h-7 w-7" />}
          title="No collections yet"
          body="Once the college administrators group cuttings by event, those collections will show up here."
        />
      )}
    </div>
  );
}

function SkeletonBoards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-black/6" />
          <div className="mt-2 h-3.5 w-2/3 animate-pulse rounded-full bg-black/6" />
          <div className="mt-1.5 h-3 w-1/3 animate-pulse rounded-full bg-black/6" />
        </div>
      ))}
    </div>
  );
}
