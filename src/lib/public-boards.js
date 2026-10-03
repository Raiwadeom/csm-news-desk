import { firebaseConfig } from "./config";

// Server-side reads of the public collections, through Firestore's REST API.
// Collections are public read, so the browser api key is enough - no admin
// credentials. Used where a page needs real names before any client code
// runs: the sitemap, and each collection's <title> for search engines.

const fieldsOf = (doc) => ({
  id: doc.name.split("/").pop(),
  name: doc.fields?.name?.stringValue || "",
  description: doc.fields?.description?.stringValue || "",
});

function base() {
  const { projectId, apiKey } = firebaseConfig;
  if (!projectId || !apiKey) return null;
  return {
    url: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/boards`,
    apiKey,
  };
}

/** Every collection, or [] if Firestore can't be reached. */
export async function fetchPublicBoards() {
  const b = base();
  if (!b) return [];
  try {
    const res = await fetch(`${b.url}?pageSize=300&key=${b.apiKey}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents || []).map(fieldsOf);
  } catch {
    return [];
  }
}

/** One collection by id, or null if it doesn't exist or can't be read. */
export async function fetchPublicBoard(id) {
  const b = base();
  if (!b || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  try {
    const res = await fetch(`${b.url}/${id}?key=${b.apiKey}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return fieldsOf(await res.json());
  } catch {
    return null;
  }
}
