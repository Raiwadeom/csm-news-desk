import { SITE_URL } from "@/lib/config";
import { fetchPublicBoards } from "@/lib/public-boards";

export default async function sitemap() {
  const lastModified = new Date();
  // Any failure gives an empty list rather than a broken sitemap: the two
  // fixed pages matter most, and every collection is reachable from
  // /collection anyway.
  const ids = (await fetchPublicBoards()).map((b) => b.id);

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
