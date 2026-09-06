"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { IconCheck, IconAlert, IconClose } from "./Icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[120] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-pop pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-2 text-sm font-medium shadow-lg ring-1 ${
              t.tone === "error"
                ? "bg-white text-brand-700 ring-brand-200"
                : "bg-ink-900 text-white ring-black/10"
            }`}
          >
            {t.tone === "error" ? (
              <IconAlert className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <IconCheck className="h-4.5 w-4.5 shrink-0" />
            )}
            <span className="min-w-0 flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="rounded-full p-1 opacity-60 transition hover:opacity-100"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
