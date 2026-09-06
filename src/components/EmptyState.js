"use client";

export default function EmptyState({ icon, title, body, actions }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <h2 className="mt-4 text-xl font-bold tracking-tight text-ink-900">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{body}</p>
      {actions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}
