import { SITE_URL, firebaseConfig } from "@/lib/config";

/**
 * Every collection's id, read straight from Firestore's REST API.
 *
 * Collections are public read, so this needs no admin credentials - the same
 * browser api key works. Any failure falls back to an empty list rather than
 * breaking the sitemap: the two fixed pages below are what matter most, and
 * every collection is reachable by crawling from /collection anyway.
 */
async function collectionIds() {
  const { projectId, apiKey } = firebaseConfig;
  if (!projectId || !apiKey) return [];
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/boards?pageSize=300&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents || []).map((doc) => doc.name.split("/").pop());
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const lastModified = new Date();
  const ids = await collectionIds();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/collection`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...ids.map((id) => ({
      url: `${SITE_URL}/collection/${id}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  ];
}
