"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { IconClose } from "./Icons";

/* ── click-outside / escape ─────────────────────────────────────── */

export function useDismissable(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return ref;
}

/* ── dropdown ───────────────────────────────────────────────────── */

export function Dropdown({
  button,
  children,
  align = "right",
  side = "down",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismissable(open, () => setOpen(false));

  const alignClass =
    align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div ref={ref} className={`relative ${className}`}>
      {button({ open, toggle: () => setOpen((v) => !v), close: () => setOpen(false) })}
      {open && (
        <div
          className={`animate-pop absolute z-50 min-w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/8 ${alignClass} ${
            side === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ icon, children, onClick, tone = "default", as = "button", ...rest }) {
  const Tag = as;
  return (
    <Tag
      type={as === "button" ? "button" : undefined}
      onClick={onClick}
      {...rest}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition ${
        tone === "danger"
          ? "text-brand-700 hover:bg-brand-50"
          : "text-ink-900 hover:bg-black/5"
      }`}
    >
      {icon && <span className="shrink-0 text-ink-500">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </Tag>
  );
}

/* ── modal ──────────────────────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  elevated = false,
}) {
  // Portalled to <body>, not rendered in place. A modal opened from a pin
  // card would otherwise sit inside the masonry's CSS `columns` container,
  // which becomes the containing block for fixed descendants - the dialog
  // came out one column wide (~170px on a phone) instead of full width.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Two effects, not one: `onClose` is usually an inline arrow, so a
  // combined effect would tear down and re-take the scroll lock on every
  // single render.
  useEffect(() => {
    if (!open) return;
    return lockBodyScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const width = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-3xl" }[size];

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end justify-center sm:items-center ${
        elevated ? "z-[130]" : "z-[100]"
      }`}
    >
      <div
        className="animate-fade absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-sheet relative flex max-h-[92dvh] w-full ${width} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl`}
      >
        <header className="flex items-start gap-3 border-b border-black/6 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold tracking-tight text-ink-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 rounded-full p-2 text-ink-500 transition hover:bg-black/5 hover:text-ink-900"
          >
            <IconClose />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-black/6 px-5 py-3.5 pb-safe sm:pb-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ── buttons & fields ───────────────────────────────────────────── */

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500/25",
    dark: "bg-ink-900 text-white hover:bg-black focus:ring-black/20",
    soft: "bg-black/6 text-ink-900 hover:bg-black/10 focus:ring-black/10",
    ghost: "text-ink-700 hover:bg-black/5 focus:ring-black/10",
    danger: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500/25",
    outline:
      "bg-white text-ink-900 ring-1 ring-black/12 hover:bg-black/4 focus:ring-black/10",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-[15px]",
    lg: "px-5 py-3 text-[15px]",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children, htmlFor }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-ink-500/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12";

/* ── confirm dialog ─────────────────────────────────────────────── */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  busy = false,
  previewSrc = "",
  previewAlt = "",
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      size="sm"
      elevated
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </>
      }
    >
      {previewSrc && (
        // Show exactly which cutting is about to go, so the confirmation is
        // not a guess about whatever is hidden behind the dialog.
        <div className="mb-4 overflow-hidden rounded-2xl bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={previewAlt}
            className="mx-auto max-h-44 w-auto max-w-full object-contain"
          />
        </div>
      )}
      <p className="text-[15px] leading-relaxed text-ink-700">{message}</p>
    </Modal>
  );
}
