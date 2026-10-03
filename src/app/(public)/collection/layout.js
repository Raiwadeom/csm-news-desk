import { COLLEGE } from "@/lib/config";

// The page itself is a client component, so its title and canonical URL
// live here. Each public page needs its own: identical titles (and a
// site-wide canonical pointing at /) are what kept Google from treating
// these as separate pages worth listing under the main result.
export const metadata = {
  // A plain string here would stop the root "%s · CSM Udgir" template from
  // reaching each collection's own title, so the template is restated.
  title: {
    default: "Collections — Events & Departments",
    template: `%s · ${COLLEGE.shortName}`,
  },
  description: `Newspaper cuttings of ${COLLEGE.name}, ${COLLEGE.city}, grouped by event and department: Jayanti celebrations, sports, NSS/NCC, workshops, results and more.`,
  alternates: { canonical: "/collection" },
  openGraph: { title: `Collections · ${COLLEGE.shortName} News Desk`, url: "/collection" },
};

export default function CollectionLayout({ children }) {
  return children;
}
