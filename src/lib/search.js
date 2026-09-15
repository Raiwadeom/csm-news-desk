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

export function tokenize(query) {
  return String(query || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function boardNamesOf(post, boardsById) {
  return (post.boardIds || [])
    .map((id) => boardsById?.[id]?.name || "")
    .filter(Boolean)
    .join(" ");
}

/** Everything about a cutting that a visitor might reasonably type. */
function postHaystack(post, boardsById) {
  return [
    post.title,
    post.note,
    post.source,
    post.ownerName,
    boardNamesOf(post, boardsById),
    // Both spellings of the date: "2026-02-19" catches a typed year,
    // "19 Feb 2026" catches a typed month.
    post.newsDate,
    formatNewsDate(post.newsDate),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function boardHaystack(board) {
  return [board.name, board.description].filter(Boolean).join(" ").toLowerCase();
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

/** Collections whose name or description matches the query. */
export function filterBoards(boards, query) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return boards;
  return boards.filter((board) => matchesAll(boardHaystack(board), tokens));
}
