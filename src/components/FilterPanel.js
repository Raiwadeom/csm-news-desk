"use client";

import { useMemo, useState } from "react";
import { filterByFacets, newspaperKey, postYear, UNDATED } from "@/lib/search";

// How many options a group shows before "Show all" - long lists of years or
// collections would otherwise push the other groups off the screen.
const COLLAPSED = 4;

export const EMPTY_FILTERS = {
  years: new Set(),
  papers: new Set(),
  boards: new Set(),
};

export function countActive(filters) {
  return filters.years.size + filters.papers.size + filters.boards.size;
}

/**
 * The "Filter cuttings" sidebar: Year, Newspaper and Collection checkbox
 * groups. Options come from the cuttings themselves, so a new paper or year
 * appears the moment one is uploaded. Each count is what that tick would
 * show given the other groups' ticks.
 */
export default function FilterPanel({
  posts,
  boards,
  filters,
  onChange,
  className = "",
}) {
  const groups = useMemo(() => {
    const tally = (key, keyOf) => {
      const counts = new Map();
      for (const post of filterByFacets(posts, filters, key)) {
        for (const k of keyOf(post))
          if (k) counts.set(k, (counts.get(k) || 0) + 1);
      }
      return counts;
    };

    // Years, newest first, with "Undated" last.
    const yearCounts = tally("years", (p) => [postYear(p)]);
    const allYears = new Set(posts.map(postYear));
    const years = [...allYears]
      .sort((a, b) => (a === UNDATED) - (b === UNDATED) || b.localeCompare(a))
      .map((y) => ({
        value: y,
        label: y === UNDATED ? "Undated" : y,
        count: yearCounts.get(y) || 0,
      }));

    // Newspapers, shown in the spelling used most often, biggest first.
    const spellings = new Map();
    for (const p of posts) {
      const key = newspaperKey(p);
      if (!key) continue;
      const forKey = spellings.get(key) || new Map();
      const label = p.source.trim().replace(/\s+/g, " ");
      forKey.set(label, (forKey.get(label) || 0) + 1);
      spellings.set(key, forKey);
    }
    const paperCounts = tally("papers", (p) => [newspaperKey(p)]);
    const papers = [...spellings.entries()]
      .map(([key, forKey]) => ({
        value: key,
        label: [...forKey.entries()].sort((a, b) => b[1] - a[1])[0][0],
        total: [...forKey.values()].reduce((a, b) => a + b, 0),
        count: paperCounts.get(key) || 0,
      }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

    // Collections that actually hold something, biggest first.
    const boardCounts = tally("boards", (p) => p.boardIds || []);
    const boardTotals = new Map();
    for (const p of posts)
      for (const id of p.boardIds || [])
        boardTotals.set(id, (boardTotals.get(id) || 0) + 1);
    const collections = boards
      .filter((b) => boardTotals.has(b.id))
      .map((b) => ({
        value: b.id,
        label: b.name,
        total: boardTotals.get(b.id),
        count: boardCounts.get(b.id) || 0,
      }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

    return [
      { key: "years", title: "Year", more: "Show all years", options: years },
      {
        key: "papers",
        title: "Newspaper",
        more: "Show all newspapers",
        options: papers,
      },
      {
        key: "boards",
        title: "Collection",
        more: "Show all collections",
        options: collections,
      },
    ].filter((g) => g.options.length > 0);
  }, [posts, boards, filters]);

  function toggle(key, value) {
    const next = new Set(filters[key]);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange({ ...filters, [key]: next });
  }

  const active = countActive(filters);

  return (
    <aside
      aria-label="Filter cuttings"
      className={`rounded-md border border-black/12 bg-white px-4 py-4 shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold text-ink-900">Filter cuttings</h2>
        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-ink-500">Nothing to filter yet.</p>
      )}

      {groups.map((group, i) => (
        <FilterGroup
          key={group.key}
          group={group}
          picked={filters[group.key]}
          onToggle={(value) => toggle(group.key, value)}
          divider={i > 0}
        />
      ))}
    </aside>
  );
}

function FilterGroup({ group, picked, onToggle, divider }) {
  const [expanded, setExpanded] = useState(false);
  const { options } = group;

  // Ticked options always stay visible, even when the list is collapsed.
  const shown = expanded
    ? options
    : options.filter((o, i) => i < COLLAPSED || picked.has(o.value));
  const hidden = options.length - shown.length;

  return (
    // The divider sits on a wrapper: a border on the fieldset itself would
    // draw through its legend.
    <div className={divider ? "mt-4 border-t border-black/8 pt-4" : ""}>
      <fieldset className="min-w-0">
        <legend className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-500">
          {group.title}
        </legend>
        <ul className="space-y-1">
          {shown.map((o) => {
            const checked = picked.has(o.value);
            const dim = !checked && o.count === 0;
            return (
              <li key={o.value}>
                <label
                  className={`flex cursor-pointer items-center gap-2.5 rounded-sm py-1 text-sm hover:text-brand-700 ${
                    dim ? "text-ink-500/60" : "text-ink-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(o.value)}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-brand-700"
                  />
                  <span className="min-w-0 flex-1 truncate" title={o.label}>
                    {o.label}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-500">
                    {o.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {(hidden > 0 || (expanded && options.length > COLLAPSED)) && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-1.5 text-[13px] font-semibold text-brand-700 hover:underline"
          >
            {expanded ? "Show fewer" : group.more}
          </button>
        )}
      </fieldset>
    </div>
  );
}
