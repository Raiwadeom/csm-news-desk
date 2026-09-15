"use client";

/** Placeholder masonry shown while the first snapshot is still in flight. */
export default function SkeletonGrid() {
  const heights = [220, 320, 180, 280, 240, 340, 200, 300, 260, 190, 310, 230];
  return (
    <div className="masonry columns-2 sm:columns-3 md:columns-4 lg:columns-5 2xl:columns-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-black/6"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}
