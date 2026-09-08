// Helpers for the "news date" on a cutting - the date the story ran in the
// paper, as opposed to createdAt (when it was uploaded to the archive).
// Stored as a plain "YYYY-MM-DD" string so it sorts and compares as text
// without any timezone conversion.

export function todayInputValue() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

export function formatNewsDate(value) {
  if (!value) return "";
  // Parsed as local midnight, not UTC, so the displayed day never shifts.
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
