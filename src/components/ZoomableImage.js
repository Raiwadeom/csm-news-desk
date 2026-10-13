"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconZoomIn, IconZoomOut, IconExpand, IconShrink } from "./Icons";
import { largeUrl, zoomUrl } from "@/lib/images";

const MIN = 1;
const MAX = 6;
const STEP = 1.5;
const DOUBLE_TAP_ZOOM = 2.5;

const clampScale = (s) => Math.min(MAX, Math.max(MIN, s));

/**
 * A newspaper cutting you can actually read: pinch, scroll-wheel, double-tap
 * or the +/- buttons to zoom, drag to move around, and a full-screen toggle.
 *
 * The image keeps its normal "fit" layout; zoom is only a CSS transform on
 * top, so nothing else in the lightbox moves. Offsets are measured from the
 * fitted image's centre, which is also the transform origin.
 */
export default function ZoomableImage({ src, alt, expanded, onToggleExpand, imgClassName = "" }) {
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const [hiRes, setHiRes] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });

  // Keep the picture from being dragged off into empty space.
  const clamp = useCallback((s, x, y) => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return { s, x, y };
    const maxX = Math.max(0, (img.offsetWidth * s - stage.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * s - stage.clientHeight) / 2);
    return {
      s,
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }, []);

  /**
   * Point (client coords) relative to the fitted image's centre - the zoom
   * origin. offsetLeft/Top ignore the transform, so this is the resting spot.
   */
  const fromCentre = useCallback((clientX, clientY) => {
    const r = stageRef.current.getBoundingClientRect();
    const img = imgRef.current;
    const cx = r.left + img.offsetLeft + img.offsetWidth / 2;
    const cy = r.top + img.offsetTop + img.offsetHeight / 2;
    return { x: clientX - cx, y: clientY - cy };
  }, []);

  /** Zooms to `next`, keeping the spot under point `p` where it is. */
  const zoomAt = useCallback(
    (next, p = { x: 0, y: 0 }) => {
      const { s, x, y } = viewRef.current;
      const s2 = clampScale(next);
      if (s2 === MIN) return setView({ s: 1, x: 0, y: 0 });
      const x2 = p.x - (s2 * (p.x - x)) / s;
      const y2 = p.y - (s2 * (p.y - y)) / s;
      setView(clamp(s2, x2, y2));
    },
    [clamp]
  );

  const reset = useCallback(() => setView({ s: 1, x: 0, y: 0 }), []);

  // Start fresh for a new cutting or when the layout changes size.
  useEffect(() => {
    reset();
    setHiRes(false);
  }, [src, reset]);
  useEffect(() => reset(), [expanded, reset]);

  // Load the sharper copy in the background the first time someone zooms.
  useEffect(() => {
    if (hiRes || view.s <= 1.2) return;
    const hi = zoomUrl(src);
    if (!hi || hi === largeUrl(src)) return;
    const pre = new window.Image();
    pre.onload = () => setHiRes(true);
    pre.src = hi;
    return () => {
      pre.onload = null;
    };
  }, [view.s, hiRes, src]);

  // Scroll wheel / trackpad pinch. Needs a non-passive listener to stop the
  // page from scrolling instead.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025));
      zoomAt(viewRef.current.s * factor, fromCentre(e.clientX, e.clientY));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [zoomAt, fromCentre]);

  // Keyboard: + / - / 0, unless the reader is typing somewhere.
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.key === "+" || e.key === "=") zoomAt(viewRef.current.s * STEP);
      else if (e.key === "-" || e.key === "_") zoomAt(viewRef.current.s / STEP);
      else if (e.key === "0") reset();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomAt, reset]);

  function startGesture() {
    const pts = [...pointers.current.values()];
    const { s, x, y } = viewRef.current;
    if (pts.length >= 2) {
      const [a, b] = pts;
      gesture.current = {
        kind: "pinch",
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid: fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2),
        s,
        x,
        y,
      };
    } else if (pts.length === 1) {
      gesture.current = { kind: "pan", px: pts[0].x, py: pts[0].y, s, x, y, moved: false };
    } else {
      gesture.current = null;
    }
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest("[data-zoom-controls]")) return;
    stageRef.current.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    startGesture();
    if (viewRef.current.s > 1 || pointers.current.size > 1) setDragging(true);
  }

  function onPointerMove(e) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;

    if (g.kind === "pinch") {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const s2 = clampScale((g.s * dist) / g.dist);
      const mid = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
      const x2 = mid.x - (s2 * (g.mid.x - g.x)) / g.s;
      const y2 = mid.y - (s2 * (g.mid.y - g.y)) / g.s;
      setView(s2 === MIN ? { s: 1, x: 0, y: 0 } : clamp(s2, x2, y2));
      return;
    }

    const dx = e.clientX - g.px;
    const dy = e.clientY - g.py;
    if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
    if (g.s > 1) setView(clamp(g.s, g.x + dx, g.y + dy));
  }

  function onPointerUp(e) {
    if (!pointers.current.has(e.pointerId)) return;
    const g = gesture.current;
    pointers.current.delete(e.pointerId);

    // Double-tap (touch) / double-click (mouse) toggles a close-up there.
    if (g?.kind === "pan" && !g.moved && pointers.current.size === 0) {
      const now = Date.now();
      const last = lastTap.current;
      const near = Math.abs(e.clientX - last.x) < 30 && Math.abs(e.clientY - last.y) < 30;
      if (now - last.t < 320 && near) {
        lastTap.current = { t: 0, x: 0, y: 0 };
        if (viewRef.current.s > 1) reset();
        else zoomAt(DOUBLE_TAP_ZOOM, fromCentre(e.clientX, e.clientY));
      } else {
        lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      }
    }

    startGesture();
    if (pointers.current.size === 0) setDragging(false);
  }

  const zoomed = view.s > 1;
  const shown = hiRes ? zoomUrl(src) : largeUrl(src);

  return (
    <div
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`relative flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden bg-black/[0.04] px-2 pb-14 pt-2 sm:px-5 sm:pb-16 sm:pt-5 ${
        zoomed ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={shown}
        alt={alt}
        draggable={false}
        style={{
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
          transition: dragging ? "none" : "transform 160ms ease-out",
        }}
        className={`w-auto max-w-full rounded-md border border-black/10 object-contain shadow-sm will-change-transform ${imgClassName}`}
      />

      <div
        data-zoom-controls
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-ink-900/85 p-1 text-white shadow-lg backdrop-blur"
      >
        <ZoomButton label="Zoom out" onClick={() => zoomAt(view.s / STEP)} disabled={!zoomed}>
          <IconZoomOut className="h-5 w-5" />
        </ZoomButton>
        <button
          type="button"
          onClick={reset}
          disabled={!zoomed}
          aria-label="Reset zoom"
          title="Reset zoom (0)"
          className="min-w-[3.25rem] rounded-full px-2 py-1.5 text-xs font-bold tabular-nums transition hover:bg-white/15 disabled:hover:bg-transparent"
        >
          {Math.round(view.s * 100)}%
        </button>
        <ZoomButton label="Zoom in" onClick={() => zoomAt(view.s * STEP)} disabled={view.s >= MAX}>
          <IconZoomIn className="h-5 w-5" />
        </ZoomButton>
        <span className="mx-0.5 h-5 w-px bg-white/25" aria-hidden="true" />
        <ZoomButton
          label={expanded ? "Exit full screen" : "Full screen"}
          onClick={onToggleExpand}
          pressed={expanded}
        >
          {expanded ? <IconShrink className="h-5 w-5" /> : <IconExpand className="h-5 w-5" />}
        </ZoomButton>
      </div>
    </div>
  );
}

function ZoomButton({ label, onClick, disabled, pressed, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
