"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import PinBrowser from "@/components/PinBrowser";
import EmptyState from "@/components/EmptyState";
import { Dropdown, MenuItem, Button } from "@/components/ui";
import {
  IconPlus,
  IconChevronDown,
  IconImage,
  IconFolder,
  IconEdit,
} from "@/components/Icons";
import { thumbUrl } from "@/lib/images";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";

export default function CollectionsPage() {
  const { posts, boards, boardStats, ready, query, openUpload, openCreateBoard, openEditBoard } =
    useApp();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("boards");

  const boardsById = useMemo(
    () => Object.fromEntries(boards.map((b) => [b.id, b])),
    [boards]
  );

  const visiblePins = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      `${p.title} ${p.note} ${p.source}`.toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div>
      {/* ── header: title + admin card ───────────────────────────── */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            Your collections
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Group newspaper cuttings by event. Every cutting also stays in the main feed.
          </p>
        </div>

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

      {/* ── tabs + create ────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-black/8">
        <div className="flex gap-1">
          {[
            { id: "pins", label: "Pins", count: posts.length },
            { id: "boards", label: "Boards", count: boards.length },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 pb-2.5 pt-1 text-[15px] font-semibold transition sm:px-4 ${
                tab === t.id
                  ? "border-ink-900 text-ink-900"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs font-bold text-ink-500">{t.count}</span>
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
          <MenuItem icon={<IconImage className="h-4.5 w-4.5" />} onClick={() => openUpload()}>
            Pin
          </MenuItem>
          <MenuItem icon={<IconFolder className="h-4.5 w-4.5" />} onClick={openCreateBoard}>
            Board
          </MenuItem>
        </Dropdown>
      </div>

      {/* ── content ──────────────────────────────────────────────── */}
      {tab === "boards" &&
        (boards.length === 0 ? (
          <EmptyState
            icon={<IconFolder className="h-7 w-7" />}
            title="Organise your cuttings"
            body="Boards are where your cuttings live. Create a board like Shivjayanti or Sports and start adding pins to it — they will keep showing in the main feed too."
            actions={
              <Button onClick={openCreateBoard}>
                <IconPlus className="h-4.5 w-4.5" />
                Create a board
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                stats={boardStats[board.id]}
                onEdit={() => openEditBoard(board)}
              />
            ))}
          </div>
        ))}

      {tab === "pins" &&
        (ready && visiblePins.length === 0 ? (
          <EmptyState
            icon={<IconImage className="h-7 w-7" />}
            title={query ? "No pins match that search" : "No pins yet"}
            body={
              query
                ? "Try a different headline or newspaper name."
                : "Upload a newspaper cutting to get started."
            }
            actions={
              !query && (
                <Button onClick={() => openUpload()}>
                  <IconPlus className="h-4.5 w-4.5" />
                  Add a pin
                </Button>
              )
            }
          />
        ) : (
          <PinBrowser posts={visiblePins} boardsById={boardsById} />
        ))}
    </div>
  );
}

function BoardCard({ board, stats, onEdit }) {
  const covers = stats?.covers || [];
  const count = stats?.count || 0;

  return (
    <div className="group">
      <Link
        href={`/collections/${board.id}`}
        className="block overflow-hidden rounded-2xl bg-black/5 ring-brand-500/40 transition group-hover:brightness-[0.97] focus:outline-none focus-visible:ring-4"
      >
        {/* Cover tiles are positioned absolutely inside fixed-ratio boxes -
            a plain grid would let each image's intrinsic height stretch its
            row and spill out of the card. */}
        <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-0.5">
          <CoverTile post={covers[0]} width={400} className="col-span-2 row-span-2" />
          <CoverTile post={covers[1]} width={200} />
          <CoverTile post={covers[2]} width={200} />
        </div>
      </Link>

      <div className="mt-2 flex items-start gap-1.5 px-0.5">
        <div className="min-w-0 flex-1">
          <Link
            href={`/collections/${board.id}`}
            className="block truncate text-[15px] font-bold text-ink-900 hover:underline"
          >
            {board.name}
          </Link>
          <p className="truncate text-[13px] text-ink-500">
            {count} {count === 1 ? "pin" : "pins"}
            {board.description ? ` · ${board.description}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${board.name}`}
          className="shrink-0 rounded-full p-1.5 text-ink-500 opacity-0 transition hover:bg-black/6 hover:text-ink-900 focus:opacity-100 group-hover:opacity-100"
        >
          <IconEdit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CoverTile({ post, width, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-black/8 ${className}`}>
      {post && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbUrl(post.imageUrl, width)}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
