import { COLLEGE, SITE_URL } from "@/lib/config";
import { fetchPublicBoard } from "@/lib/public-boards";

// A real <title> per collection ("Jayanti 2026 — Newspaper Cuttings"), read
// on the server so search engines see it without running the client app.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const board = await fetchPublicBoard(id);
  if (!board?.name) {
    return { title: "Collection", alternates: { canonical: `/collection/${id}` } };
  }
  const title = `${board.name} — Newspaper Cuttings`;
  const description =
    board.description ||
    `Newspaper coverage of ${board.name} at ${COLLEGE.name}, ${COLLEGE.city}.`;
  return {
    title,
    description,
    alternates: { canonical: `/collection/${id}` },
    openGraph: { title, description, url: `/collection/${id}` },
  };
}

export default async function CollectionItemLayout({ children, params }) {
  const { id } = await params;
  const board = await fetchPublicBoard(id);

  // Breadcrumbs (Archive › Collections › Jayanti 2026) tell Google how the
  // pages hang together, which is what its sitelinks are built from.
  const breadcrumbs = board?.name && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Newspaper Archive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${SITE_URL}/collection` },
      { "@type": "ListItem", position: 3, name: board.name, item: `${SITE_URL}/collection/${id}` },
    ],
  };

  return (
    <>
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\u003c") }}
        />
      )}
      {children}
    </>
  );
}
