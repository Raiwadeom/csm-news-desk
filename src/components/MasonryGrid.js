"use client";

import PinCard from "./PinCard";

/**
 * The Pinterest layout. CSS multi-column keeps every card at its natural
 * aspect ratio, so portrait and landscape cuttings sit together without
 * being cropped to a uniform tile.
 */
const DEFAULT_COLUMNS = "columns-2 sm:columns-3 md:columns-4 lg:columns-5 2xl:columns-6";

export default function MasonryGrid({
  posts,
  boardsById,
  onOpen,
  readOnly = false,
  columns = DEFAULT_COLUMNS,
}) {
  return (
    <div className={`masonry ${columns}`}>
      {posts.map((post) => (
        <PinCard
          key={post.id}
          post={post}
          boardsById={boardsById}
          onOpen={onOpen}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
