"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import ArchiveBrowser, {
  ArchiveSearch,
  PageHeading,
  ResultsBar,
} from "@/components/ArchiveBrowser";
import EmptyState from "@/components/EmptyState";
import SkeletonGrid from "@/components/SkeletonGrid";
import BoardCard from "@/components/BoardCard";
import { Dropdown, MenuItem, Button } from "@/components/ui";
import {
  IconPlus,
  IconChevronDown,
  IconImage,
  IconFolder,
} from "@/components/Icons";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";
import {
  filterPosts,
  filterBoards,
  sortBoards,
  BOARD_SORT_OPTIONS,
} from "@/lib/search";

export default function CollectionsPage() {
  const {
    posts,
    boards,
    boardStats,
    ready,
    query,
    setQuery,
    openUpload,
    openCreateBoard,
    openEditBoard,
  } = useApp();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("boards");
  const [boardSort, setBoardSort] = useState("newest");

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards],
  );

  const visiblePins = useMemo(
    () => filterPosts(posts, query, boardsById),
    [posts, query, boardsById],
  );
  const visibleBoards = useMemo(
    () => sortBoards(filterBoards(boards, query), boardSort, boardStats),
    [boards, query, boardSort, boardStats],
  );

  return (
    <div>
      {/* ── header: title + admin card ───────────────────────────── */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeading className="">Collections</PageHeading>

        <Link
          href="/profile"
          className="flex shrink-0 items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-black/4"
        >
          <Avatar profile={profile} email={user?.email} size={52} />
          <span className="min-w-0">
            <span className="block truncate text-[17px] font-bold text-ink-900">
              {profile?.name || "Administrator"}
            </span>
            <span className="block truncate text-sm text-ink-500">
              {profile?.role || "Admin"}
            </span>
          </span>
        </Link>
      </div>

      <ArchiveSearch
        query={query}
        setQuery={setQuery}
        placeholder={
          tab === "boards"
            ? "Search collections by name or event"
            : "Search by headline, date, newspaper or event"
        }
        className="mb-6"
      />

      {/* ── tabs + create ────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-black/8">
        <div className="flex gap-1">
          {[
            { id: "pins", label: "Pins", count: visiblePins.length },
            { id: "boards", label: "Boards", count: visibleBoards.length },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 pb-2.5 pt-1 text-[15px] font-semibold transition sm:px-4 ${
                tab === t.id
                  ? "border-brand-700 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs font-bold text-ink-500">
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <Dropdown
          className="pb-2"
          button={({ toggle, open }) => (
            <Button variant="dark" size="sm" onClick={toggle}>
              <IconPlus className="h-4 w-4" />
              Create
              <IconChevronDown
                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </Button>
          )}
        >
          <MenuItem
            icon={<IconImage className="h-4.5 w-4.5" />}
            onClick={() => openUpload()}
          >
            Pin
          </MenuItem>
          <MenuItem
            icon={<IconFolder className="h-4.5 w-4.5" />}
            onClick={openCreateBoard}
          >
            Board
          </MenuItem>
        </Dropdown>
      </div>

      {/* ── content ──────────────────────────────────────────────── */}
      {tab === "boards" &&
        (visibleBoards.length === 0 ? (
          <EmptyState
            icon={<IconFolder className="h-7 w-7" />}
            title={query ? "No board by that name" : "Organise your cuttings"}
            body={
              query
                ? "Try part of the event name, or switch to the Pins tab to search every cutting."
                : "Boards are where your cuttings live. Create a board like Shivjayanti or Sports and start adding pins to it — they will keep showing in the main feed too."
            }
            actions={
              !query && (
                <Button onClick={openCreateBoard}>
                  <IconPlus className="h-4.5 w-4.5" />
                  Create a board
                </Button>
              )
            }
          />
        ) : (
          <>
            <ResultsBar
              shown={visibleBoards.length}
              total={boards.length}
              noun="collections"
              query={query}
              sort={boardSort}
              setSort={setBoardSort}
              options={BOARD_SORT_OPTIONS}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  stats={boardStats[board.id]}
                  href={`/collections/${board.id}`}
                  onEdit={() => openEditBoard(board)}
                />
              ))}
            </div>
          </>
        ))}

      {tab === "pins" && !ready && <SkeletonGrid />}

      {tab === "pins" && ready && posts.length === 0 && (
        <EmptyState
          icon={<IconImage className="h-7 w-7" />}
          title="No pins yet"
          body="Upload a newspaper cutting to get started."
          actions={
            <Button onClick={() => openUpload()}>
              <IconPlus className="h-4.5 w-4.5" />
              Add a pin
            </Button>
          }
        />
      )}

      {tab === "pins" && ready && posts.length > 0 && (
        <ArchiveBrowser
          posts={visiblePins}
          total={posts.length}
          boards={boards}
          boardsById={boardsById}
          query={query}
        />
      )}
    </div>
  );
}
