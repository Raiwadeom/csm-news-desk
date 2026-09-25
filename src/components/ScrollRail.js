"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "./Icons";

// A horizontal chip rail that can actually be scrolled with a mouse: arrow
// buttons at either end, drag-to-scroll on the chips themselves, and a slim
// draggable bar underneath showing how much of the rail is in view.
export default function ScrollRail({ children, className = "" }) {
  const railRef = useRef(null);
  const drag = useRef(null);
  const [metrics, setMetrics] = useState({ left: 0, width: 1, max: 0 });

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setMetrics({
      left: el.scrollLeft,
      width: el.clientWidth / el.scrollWidth,
      max: Math.max(0, max),
    });
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [measure, children]);

  const overflowing = metrics.max > 1;
  const atStart = metrics.left <= 1;
  const atEnd = metrics.left >= metrics.max - 1;

  function nudge(dir) {
    const el = railRef.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  }

  // Drag the chips themselves with a mouse (touch already scrolls natively).
  function onRailPointerDown(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, start: railRef.current.scrollLeft, moved: false };
  }
  function onRailPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      railRef.current.setPointerCapture(e.pointerId);
    }
    if (d.moved) railRef.current.scrollLeft = d.start - dx;
  }
  function onRailPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      // Swallow the click that follows a drag so no chip gets selected.
      const swallow = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
    }
  }

  // The bar underneath: drag the thumb, or click the track to jump.
  const trackRef = useRef(null);
  function onThumbPointerDown(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = railRef.current;
    const track = trackRef.current;
    const startX = e.clientX;
    const startLeft = el.scrollLeft;
    const ratio = el.scrollWidth / track.clientWidth;
    const move = (ev) => {
      el.scrollLeft = startLeft + (ev.clientX - startX) * ratio;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  function onTrackPointerDown(e) {
    const el = railRef.current;
    const rect = trackRef.current.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    el.scrollTo({ left: frac * el.scrollWidth - el.clientWidth / 2, behavior: "smooth" });
  }

  const thumbWidth = Math.max(metrics.width * 100, 8);
  const thumbLeft = metrics.max ? (metrics.left / metrics.max) * (100 - thumbWidth) : 0;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={railRef}
        onScroll={measure}
        onPointerDown={onRailPointerDown}
        onPointerMove={onRailPointerMove}
        onPointerUp={onRailPointerUp}
        onPointerCancel={() => (drag.current = null)}
        className="no-scrollbar flex select-none gap-2 overflow-x-auto px-3 pb-1 sm:px-5"
      >
        {children}
      </div>

      {overflowing && !atStart && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start bg-gradient-to-r from-white via-white/90 to-transparent pb-1 pl-1 pr-8">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Scroll collections left"
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-ink-900 shadow-sm transition hover:bg-black/5"
          >
            <IconChevronLeft className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
      {overflowing && !atEnd && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-start bg-gradient-to-l from-white via-white/90 to-transparent pb-1 pl-8 pr-1">
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Scroll collections right"
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-ink-900 shadow-sm transition hover:bg-black/5"
          >
            <IconChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {overflowing && (
        <div className="px-3 pt-2 sm:px-5">
          <div
            ref={trackRef}
            onPointerDown={onTrackPointerDown}
            className="relative h-1.5 cursor-pointer rounded-full bg-black/8"
          >
            <div
              onPointerDown={onThumbPointerDown}
              style={{ width: `${thumbWidth}%`, left: `${thumbLeft}%` }}
              className="absolute inset-y-0 cursor-grab touch-none rounded-full bg-[#5c1310]/60 transition-colors hover:bg-[#5c1310] active:cursor-grabbing"
            />
          </div>
        </div>
      )}
    </div>
  );
}
