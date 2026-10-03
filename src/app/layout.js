import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { COLLEGE, SITE_URL as siteUrl } from "@/lib/config";

const title = `News Desk · ${COLLEGE.shortName}`;
const description = `Newspaper cutting archive of ${COLLEGE.name}, ${COLLEGE.city} — decades of press coverage, kept in one place and free to browse.`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${COLLEGE.shortName}` },
  description,
  applicationName: title,
  // /favicon.ico first and at the default location: it is where Google looks
  // for the icon it puts beside a search result, and it was a 404 until now,
  // which is why results showed a blank globe instead of the college crest.
  // The 512px png stays for high-density displays and the share card.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/clg-logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/clg-logo.png",
  },
  // No site-wide canonical: set here it was inherited by every page, telling
  // Google each collection was a duplicate of the home page. Pages that
  // need one set their own (see the collection layouts).
  // Without these a link pasted into WhatsApp shows a bare URL and no image,
  // which is how most people will meet this archive.
  openGraph: {
    type: "website",
    siteName: title,
    title,
    description,
    url: siteUrl,
    locale: "en_IN",
    images: [{ url: "/clg-logo.png", width: 512, height: 512, alt: `${COLLEGE.name} logo` }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/clg-logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#d3202a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Tells search engines who the archive belongs to and what it is called,
// so results show the college by name and the site is understood as one
// organised whole rather than a loose set of pages.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollegeOrUniversity",
      "@id": `${siteUrl}/#college`,
      name: COLLEGE.name,
      alternateName: [COLLEGE.shortName, COLLEGE.formerName],
      logo: `${siteUrl}${COLLEGE.logo}`,
      foundingDate: "1968-06",
      parentOrganization: { "@type": "Organization", name: COLLEGE.trust },
      address: {
        "@type": "PostalAddress",
        addressLocality: COLLEGE.city,
        addressRegion: COLLEGE.state,
        postalCode: COLLEGE.pinCode,
        addressCountry: "IN",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: `${COLLEGE.shortName} News Desk`,
      alternateName: title,
      description,
      inLanguage: "en-IN",
      publisher: { "@id": `${siteUrl}/#college` },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
