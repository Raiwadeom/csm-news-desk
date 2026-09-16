import { SITE_URL } from "@/lib/config";

/**
 * Serves /robots.txt. Without one, search engines have to discover the site
 * by guesswork; this points them straight at the sitemap and keeps them out
 * of the admin side, which needs a sign-in and has nothing worth indexing.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/feed", "/collections", "/profile", "/login", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
