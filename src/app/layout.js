import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { COLLEGE } from "@/lib/config";

export const metadata = {
  title: `News Desk · ${COLLEGE.shortName}`,
  description: `Newspaper cutting archive of ${COLLEGE.name}, ${COLLEGE.city} — upload, organise into collections and download press coverage.`,
  icons: { icon: "/clg-logo.png", apple: "/clg-logo.png" },
  manifest: undefined,
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
