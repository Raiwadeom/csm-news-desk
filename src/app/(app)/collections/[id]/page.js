"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PinBrowser from "@/components/PinBrowser";
import EmptyState from "@/components/EmptyState";
import SkeletonGrid from "@/components/SkeletonGrid";
import { Button } from "@/components/ui";
import {
  IconChevronLeft,
  IconPlus,
  IconEdit,
  IconFolder,
  IconImage,
} from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterPosts } from "@/lib/search";

export default function BoardPage() {
  const { id } = useParams();
  const { posts, boards, ready, query, openUpload, openEditBoard } = useApp();

  const board = boards.find((b) => b.id === id);

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  const pins = useMemo(
    () =>
      filterPosts(
        posts.filter((p) => (p.boardIds || []).includes(id)),
        query,
        boardsById
      ),
    [posts, id, query, boardsById]
  );

  if (ready && !board) {
    return (
      <EmptyState
        icon={<IconFolder className="h-7 w-7" />}
        title="Collection not found"
        body="It may have been deleted. The cuttings that were in it are still in the main feed."
        actions={
          <Link
            href="/collections"
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-700"
          >
            Back to collections
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link
        href="/collections"
        className="mb-4 inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <IconChevronLeft className="h-4.5 w-4.5" />
        All collections
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {board?.name || "…"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {pins.length} {pins.length === 1 ? "cutting" : "cuttings"}
            {board?.description ? ` · ${board.description}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => board && openEditBoard(board)}>
            <IconEdit className="h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" onClick={() => openUpload(id)}>
            <IconPlus className="h-4 w-4" />
            Add pins
          </Button>
        </div>
      </header>

      {!ready && <SkeletonGrid />}

      {ready && pins.length === 0 ? (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title={query ? "Nothing matches that search here" : "This collection is empty"}
          body={
            query
              ? "Clear the search box to see everything in this collection."
              : "Upload cuttings straight into this collection — they will appear here and in the main feed at the same time."
          }
          actions={
            !query && (
              <Button onClick={() => openUpload(id)}>
                <IconPlus className="h-4.5 w-4.5" />
                Upload into this collection
              </Button>
            )
          }
        />
      ) : (
        ready && <PinBrowser posts={pins} boardsById={boardsById} />
      )}
    </div>
  );
}
