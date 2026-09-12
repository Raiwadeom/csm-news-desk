"use client";

// One reference-counted lock on page scrolling, shared by every dialog.
//
// Each overlay used to save and restore document.body.style.overflow by
// itself. That breaks as soon as two of them stack: the delete confirmation
// opens over the full-screen view, saves the "hidden" the view had already
// set, and restores it on the way out - leaving the page permanently
// unscrollable. Counting the locks instead means only the last one out
// restores anything, and it restores the value from before the first lock.

let locks = 0;
let previousOverflow = "";

/** Locks page scrolling. Returns the matching unlock, safe to call once. */
export function lockBodyScroll() {
  if (typeof document === "undefined") return () => {};

  if (locks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  locks += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.body.style.overflow = previousOverflow;
  };
}
