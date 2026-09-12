import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { COLLEGE } from "@/lib/config";

// Set NEXT_PUBLIC_SITE_URL to the real domain once it is bought - it is
// what makes the share card's image URL absolute.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://csm-news-desk.vercel.app";

const title = `News Desk · ${COLLEGE.shortName}`;
const description = `Newspaper cutting archive of ${COLLEGE.name}, ${COLLEGE.city} — decades of press coverage, kept in one place and free to browse.`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${COLLEGE.shortName}` },
  description,
  applicationName: title,
  icons: { icon: "/clg-logo.png", apple: "/clg-logo.png" },
  alternates: { canonical: "/" },
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
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
