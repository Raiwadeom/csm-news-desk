"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ArchiveBrowser, {
  ArchiveSearch,
  PageHeading,
} from "@/components/ArchiveBrowser";
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
  const { posts, boards, ready, query, setQuery, openUpload, openEditBoard } =
    useApp();

  const board = boards.find((b) => b.id === id);

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards],
  );

  const inBoard = useMemo(
    () => posts.filter((p) => (p.boardIds || []).includes(id)),
    [posts, id],
  );
  const pins = useMemo(
    () => filterPosts(inBoard, query, boardsById),
    [inBoard, query, boardsById],
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
            className="inline-flex items-center justify-center rounded-md bg-brand-700 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-800"
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
        className="mb-4 inline-flex items-center gap-1.5 rounded-md py-1 pr-3 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
      >
        <IconChevronLeft className="h-4.5 w-4.5" />
        All collections
      </Link>

      <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <PageHeading className="">{board?.name || "…"}</PageHeading>
          {board?.description && (
            <p className="mt-1 pl-4 text-sm text-ink-500">
              {board.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => board && openEditBoard(board)}
          >
            <IconEdit className="h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" onClick={() => openUpload(id)}>
            <IconPlus className="h-4 w-4" />
            Add pins
          </Button>
        </div>
      </header>

      <ArchiveSearch
        query={query}
        setQuery={setQuery}
        placeholder="Search in this collection"
        className="mb-6"
      />

      {!ready && <SkeletonGrid />}

      {ready && inBoard.length === 0 && (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title="This collection is empty"
          body="Upload cuttings straight into this collection — they will appear here and in the main feed at the same time."
          actions={
            <Button onClick={() => openUpload(id)}>
              <IconPlus className="h-4.5 w-4.5" />
              Upload into this collection
            </Button>
          }
        />
      )}

      {ready && inBoard.length > 0 && (
        <ArchiveBrowser
          posts={pins}
          total={inBoard.length}
          boards={boards}
          boardsById={boardsById}
          query={query}
          showCollections={false}
        />
      )}
    </div>
  );
}
