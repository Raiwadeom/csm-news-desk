"use client";

import { useMemo, useState } from "react";
import PinBrowser from "./PinBrowser";
import EmptyState from "./EmptyState";
import FilterPanel, { EMPTY_FILTERS, countActive } from "./FilterPanel";
import { IconImage, IconChevronDown, IconSearch, IconClose } from "./Icons";
import { filterByFacets, sortPosts, SORT_OPTIONS } from "@/lib/search";

// Narrower columns than the full-width grid, since the filter sidebar takes
// a column of its own from lg up.
const GRID_COLUMNS = "columns-2 sm:columns-3 md:columns-4 lg:columns-3 xl:columns-4 2xl:columns-5";

/**
 * The full-width search box under a page heading. It searches as you type;
 * the button is there for people who expect one, and drops the phone
 * keyboard so the results are in view.
 */
export function ArchiveSearch({ query, setQuery, className = "" }) {
  function submit(e) {
    e.preventDefault();
    e.currentTarget.querySelector("input")?.blur();
  }

  return (
    <form role="search" onSubmit={submit} className={`flex gap-2 ${className}`}>
      <div className="relative min-w-0 flex-1">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by headline, date, newspaper or event"
          aria-label="Search cuttings"
          className="h-11 w-full rounded-md border border-black/15 bg-white pl-10 pr-9 text-[15px] shadow-sm outline-none transition placeholder:text-ink-500 focus:border-[#b91c1c] focus:ring-4 focus:ring-[#b91c1c]/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-500 transition hover:bg-black/8 hover:text-ink-900"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-md bg-[#b91c1c] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#991b1b] sm:px-8"
      >
        Search
      </button>
    </form>
  );
}

/**
 * The "Filter cuttings" sidebar, the "Showing N cuttings · Sort by" bar and
 * the grid, shared by the public archive and the admin feed so both browse
 * the same way. `posts` is what the search (and any other page-level
 * narrowing) has already left; `total` is the whole archive, for the count.
 */
export default function ArchiveBrowser({ posts, total, boards, boardsById, query, readOnly = false }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const activeFilters = countActive(filters);

  const visible = useMemo(
    () => sortPosts(filterByFacets(posts, filters), sort),
    [posts, filters, sort]
  );

  const narrowed = visible.length !== total;
  const phrase = query.trim();

  return (
    <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:items-start lg:gap-6">
      {/* On a phone the panel folds away behind a button above the grid. */}
      <button
        type="button"
        onClick={() => setFiltersOpen((o) => !o)}
        aria-expanded={filtersOpen}
        aria-controls="filter-panel"
        className="mb-3 flex w-full items-center justify-between rounded-md border border-black/12 bg-white px-4 py-2.5 text-sm font-bold text-ink-900 shadow-sm lg:hidden"
      >
        <span>
          Filter cuttings
          {activeFilters > 0 && (
            <span className="ml-2 rounded-sm bg-[#b91c1c] px-1.5 py-0.5 text-[11px] text-white">
              {activeFilters}
            </span>
          )}
        </span>
        <IconChevronDown
          className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="filter-panel"
        className={`${filtersOpen ? "block" : "hidden"} mb-4 lg:sticky lg:top-20 lg:mb-0 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overflow-x-hidden`}
      >
        <FilterPanel posts={posts} boards={boards} filters={filters} onChange={setFilters} />
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-sm text-ink-500">
            {narrowed ? (
              <>
                Showing <span className="font-semibold text-ink-900">{visible.length}</span> of{" "}
                {total} cuttings
                {phrase && (
                  <>
                    {" "}for <span className="font-semibold text-ink-900">“{phrase}”</span>
                  </>
                )}
              </>
            ) : (
              <>
                Showing all <span className="font-semibold text-ink-900">{total}</span> cuttings
              </>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 cursor-pointer rounded-md border border-black/15 bg-white px-2.5 text-sm font-semibold text-ink-900 shadow-sm outline-none focus:border-[#b91c1c] focus:ring-4 focus:ring-[#b91c1c]/10"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length > 0 && (
          <PinBrowser
            posts={visible}
            boardsById={boardsById}
            readOnly={readOnly}
            columns={GRID_COLUMNS}
          />
        )}

        {visible.length === 0 && (
          <EmptyState
            icon={<IconImage className="h-7 w-7" />}
            title={activeFilters > 0 ? "No cuttings match these filters" : "Nothing matches that search"}
            body={
              activeFilters > 0
                ? "Untick a year, newspaper or collection in the filter panel, or clear them all."
                : "Try a headline, a newspaper name, the name of a collection such as “Shivjayanti”, or the date it was published — 2/2/2021 works, and so does 2 Feb 2021."
            }
          />
        )}
      </div>
    </div>
  );
}
