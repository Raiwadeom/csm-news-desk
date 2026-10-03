// One search implementation, shared by the public archive and the admin
// side, so a phrase typed in either place matches the same things.
//
// The query is split into words and *every* word has to appear somewhere in
// the cutting, rather than the whole phrase having to appear as one run of
// characters. That is what makes narrowing work the way people expect:
//
//   "shivjayanti"        -> every cutting in every Shivjayanti collection
//   "shivjayanti 2026"   -> only the ones in "Shivjayanti 2026" (or dated 2026)
//   "2026 shivjayanti"   -> the same, word order does not matter
//
// A cutting is searched by its own words *and* by the names of the
// collections it sits in, which is what ties the two together.

import { formatNewsDate } from "./dates";

// Dates are levelled out on both sides of the comparison so that the way
// somebody types one never decides whether it is found:
//
//   separators   "2-2-2021" and "2.2.2021" both become "2/2/2021"
//   zero padding "09/07/2021" becomes "9/7/2021"
//
// This runs over ordinary text too, which matters here because plenty of
// the cuttings are titled with nothing but their date ("09.07.2021").
const DATE_SEPARATORS = /[.\/\-\u2010-\u2015]/g;
const LEADING_ZEROS = /\b0+(\d)/g;

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(DATE_SEPARATORS, "/")
    .replace(LEADING_ZEROS, "$1");
}

export function tokenize(query) {
  return normalize(query)
    .split(/[\s,]+/)
    .filter(Boolean);
}

/**
 * The spellings of one publication date that somebody might type. A cutting
 * from 2 February 2021 is stored as "2021-02-02" but will be searched for
 * as "2/2/2021" far more often, so every reasonable form is indexed.
 */
function dateVariants(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const pad = (n) => String(n).padStart(2, "0");

  return [
    value, // 2021-02-02, the stored form
    `${day}/${month}/${year}`, // 2/2/2021
    `${pad(day)}/${pad(month)}/${year}`, // 02/02/2021
    `${day}/${month}/${String(year).slice(2)}`, // 2/2/21
    formatNewsDate(value), // 2 Feb 2021
    d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), // February 2021
  ].join(" ");
}

function boardNamesOf(post, boardsById) {
  return (post.boardIds || [])
    .map((id) => boardsById?.[id]?.name || "")
    .filter(Boolean)
    .join(" ");
}

/** Everything about a cutting that a visitor might reasonably type. */
function postHaystack(post, boardsById) {
  const parts = [
    post.title,
    post.note,
    post.source,
    post.ownerName,
    boardNamesOf(post, boardsById),
    dateVariants(post.newsDate),
  ]
    .filter(Boolean)
    .join(" ");
  return normalize(parts);
}

function boardHaystack(board) {
  return normalize([board.name, board.description].filter(Boolean).join(" "));
}

function matchesAll(haystack, tokens) {
  return tokens.every((t) => haystack.includes(t));
}

/** Cuttings matching the query, searched by their collections' names too. */
export function filterPosts(posts, query, boardsById) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return posts;
  return posts.filter((post) => matchesAll(postHaystack(post, boardsById), tokens));
}

/**
 * Cuttings published inside an inclusive date range. Both bounds are
 * optional, so "everything from 2021 onwards" is a range too. Entered back
 * to front they are swapped rather than quietly matching nothing.
 *
 * Undated cuttings are excluded: an unknown date cannot be shown to fall in
 * a range, and including them would make the count meaningless.
 */
export function filterByDateRange(posts, from, to) {
  if (!from && !to) return posts;
  const [lo, hi] = from && to && from > to ? [to, from] : [from, to];
  // "YYYY-MM-DD" strings compare chronologically as plain text, so there is
  // no parsing and no timezone to get wrong.
  return posts.filter((post) => {
    if (!post.newsDate) return false;
    if (lo && post.newsDate < lo) return false;
    if (hi && post.newsDate > hi) return false;
    return true;
  });
}

/** Collections whose name or description matches the query. */
export function filterBoards(boards, query) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return boards;
  return boards.filter((board) => matchesAll(boardHaystack(board), tokens));
}

// ---- Sidebar filters -------------------------------------------------------
//
// The checkbox panel on the archive narrows by three facets: the year the
// story ran, the newspaper it ran in and the collections it sits in. Ticks
// inside one group widen (2023 *or* 2024), ticks across groups narrow
// (2024 *and* Lokmat), which is how every shop filter behaves.

// Cuttings uploaded without a news date get a year option of their own, so
// they can be found (or hidden) like any other year.
export const UNDATED = "undated";

export function postYear(post) {
  return /^\d{4}/.test(post.newsDate || "") ? post.newsDate.slice(0, 4) : UNDATED;
}

// "Lokmat", "lokmat " and "LOKMAT" are one paper, typed three ways.
export function newspaperKey(post) {
  return String(post.source || "").trim().replace(/\s+/g, " ").toLowerCase();
}

const FACET_TESTS = {
  years: (post, picked) => picked.has(postYear(post)),
  papers: (post, picked) => picked.has(newspaperKey(post)),
  boards: (post, picked) => (post.boardIds || []).some((id) => picked.has(id)),
};

/**
 * Cuttings passing every ticked group. `skip` leaves one group out, which is
 * what each group's own counts are worked out against - so ticking 2024
 * still shows how many 2023 cuttings ticking that would add.
 */
export function filterByFacets(posts, filters, skip) {
  const active = Object.entries(FACET_TESTS).filter(
    ([key]) => key !== skip && filters[key]?.size > 0
  );
  if (active.length === 0) return posts;
  return posts.filter((post) => active.every(([key, test]) => test(post, filters[key])));
}

// ---- Sort order ------------------------------------------------------------

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "added", label: "Recently added" },
  { value: "title", label: "Title A–Z" },
];

const addedAt = (post) => post.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;

/**
 * Cuttings in the chosen order. "Newest"/"oldest" go by the date the story
 * ran, with undated cuttings always at the end so they never crowd out the
 * dated ones; ties fall back to upload order.
 */
export function sortPosts(posts, sort) {
  const byAdded = (a, b) => addedAt(b) - addedAt(a);
  const rows = [...posts];
  if (sort === "added") return rows.sort(byAdded);
  if (sort === "title") {
    return rows.sort(
      (a, b) =>
        (a.title || "").localeCompare(b.title || "", "en", { numeric: true, sensitivity: "base" }) ||
        byAdded(a, b)
    );
  }
  const dir = sort === "oldest" ? 1 : -1;
  return rows.sort((a, b) => {
    if (!a.newsDate || !b.newsDate) {
      if (a.newsDate !== b.newsDate) return a.newsDate ? -1 : 1;
      return byAdded(a, b);
    }
    return dir * a.newsDate.localeCompare(b.newsDate) || byAdded(a, b);
  });
}

export const BOARD_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "size", label: "Most cuttings" },
];

/** Collections in the chosen order; `stats` supplies the cutting counts. */
export function sortBoards(boards, sort, stats = {}) {
  const created = (b) => b.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
  const byName = (a, b) =>
    (a.name || "").localeCompare(b.name || "", "en", { numeric: true, sensitivity: "base" });
  const rows = [...boards];
  if (sort === "oldest") return rows.sort((a, b) => created(a) - created(b));
  if (sort === "name") return rows.sort(byName);
  if (sort === "size") {
    return rows.sort(
      (a, b) => (stats[b.id]?.count || 0) - (stats[a.id]?.count || 0) || byName(a, b)
    );
  }
  return rows.sort((a, b) => created(b) - created(a));
}
