"use client";

import { useMemo } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import BoardCard from "@/components/BoardCard";
import { IconFolder, IconAlert, IconHome } from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterBoards } from "@/lib/search";

/**
 * The public index of collections. Searching here matches a collection's
 * name and description - "shivjayanti" brings up every Shivjayanti set,
 * "shivjayanti 2026" just the one.
 */
export default function PublicCollectionsPage() {
  const { boards, boardStats, ready, dataError, query } = useApp();

  const visible = useMemo(() => filterBoards(boards, query), [boards, query]);

  const isEmpty = ready && boards.length === 0;
  const noMatches = ready && boards.length > 0 && visible.length === 0;

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

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Collections
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Cuttings grouped by event. Open one to see everything in it — every
          cutting is in the main feed as well.
        </p>
      </div>

      {query.trim() && ready && visible.length > 0 && (
        <p className="mb-3 text-sm text-ink-500">
          {visible.length} collection{visible.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-ink-900">“{query.trim()}”</span>
        </p>
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-700"
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
