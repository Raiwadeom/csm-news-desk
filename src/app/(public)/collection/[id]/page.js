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
import { IconChevronLeft, IconFolder, IconImage } from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { filterPosts } from "@/lib/search";

/** One collection, open to everyone. The search box narrows within it. */
export default function PublicCollectionPage() {
  const { id } = useParams();
  const { posts, boards, ready, query, setQuery } = useApp();

  const board = boards.find((b) => b.id === id);

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards],
  );

  const inBoard = useMemo(
    () => posts.filter((p) => (p.boardIds || []).includes(id)),
    [posts, id],
  );
  const visible = useMemo(
    () => filterPosts(inBoard, query, boardsById),
    [inBoard, query, boardsById],
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
            className="inline-flex items-center justify-center rounded-md bg-brand-700 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-800"
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
        className="mb-4 inline-flex items-center gap-1.5 rounded-md py-1 pr-3 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
      >
        <IconChevronLeft className="h-4.5 w-4.5" />
        All collections
      </Link>

      <PageHeading className="mb-1">{board?.name || "…"}</PageHeading>
      {board?.description && (
        <p className="mb-4 pl-4 text-sm text-ink-500">{board.description}</p>
      )}

      <ArchiveSearch
        query={query}
        setQuery={setQuery}
        placeholder="Search in this collection"
        className="mb-6 mt-4"
      />

      {!ready && <SkeletonGrid />}

      {ready && inBoard.length > 0 && (
        <ArchiveBrowser
          posts={visible}
          total={inBoard.length}
          boards={boards}
          boardsById={boardsById}
          query={query}
          readOnly
          showCollections={false}
        />
      )}

      {ready && inBoard.length === 0 && (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title="This collection is empty"
          body="Cuttings added to this collection will appear here."
        />
      )}
    </div>
  );
}
