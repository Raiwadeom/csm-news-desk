"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PinBrowser from "@/components/PinBrowser";
import EmptyState from "@/components/EmptyState";
import SkeletonGrid from "@/components/SkeletonGrid";
import { IconChevronLeft, IconFolder, IconImage } from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterPosts } from "@/lib/search";

/** One collection, open to everyone. The search box narrows within it. */
export default function PublicCollectionPage() {
  const { id } = useParams();
  const { posts, boards, ready, query } = useApp();

  const board = boards.find((b) => b.id === id);

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  const inBoard = useMemo(
    () => posts.filter((p) => (p.boardIds || []).includes(id)),
    [posts, id]
  );
  const visible = useMemo(
    () => filterPosts(inBoard, query, boardsById),
    [inBoard, query, boardsById]
  );

  if (ready && !board) {
    return (
      <EmptyState
        icon={<IconFolder className="h-7 w-7" />}
        title="Collection not found"
        body="It may have been removed. The cuttings that were in it are still in the main feed."
        actions={
          <Link
            href="/collection"
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-700"
          >
            All collections
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link
        href="/collection"
        className="mb-4 inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <IconChevronLeft className="h-4.5 w-4.5" />
        All collections
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {board?.name || "…"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {query.trim() && visible.length !== inBoard.length
            ? `${visible.length} of ${inBoard.length} `
            : `${inBoard.length} `}
          {inBoard.length === 1 ? "cutting" : "cuttings"}
          {board?.description ? ` · ${board.description}` : ""}
        </p>
      </header>

      {!ready && <SkeletonGrid />}

      {ready && visible.length > 0 && (
        <PinBrowser posts={visible} boardsById={boardsById} readOnly />
      )}

      {ready && visible.length === 0 && (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title={
            query.trim() ? "Nothing matches that search here" : "This collection is empty"
          }
          body={
            query.trim()
              ? "Clear the search box to see everything in this collection."
              : "Cuttings added to this collection will appear here."
          }
        />
      )}
    </div>
  );
}
