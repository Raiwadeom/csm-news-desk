// Every backend key the app needs, read from .env.local (or the Vercel
// project settings in production).

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// The canonical address of the site. Set NEXT_PUBLIC_SITE_URL in Vercel the
// moment a custom domain goes live - it is what makes share-card images and
// the sitemap absolute, and until it is set both still point at the old host.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://csm-news-desk.vercel.app";

export const cloudinaryCloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

export const isCloudinaryConfigured = Boolean(cloudinaryCloudName);

/** Names of the keys that are still missing, for the setup screen. */
export function missingKeys() {
  const missing = [];
  if (!firebaseConfig.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseConfig.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!firebaseConfig.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!firebaseConfig.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!cloudinaryCloudName) missing.push("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  return missing;
}

// The credit line shown on the login screen and at the foot of the public
// archive. With no url the name renders as plain text rather than a dead
// link, so a missing portfolio address can never ship a broken link.
export const BUILDER = {
  name: "Omrushikesh Vijaykumar Raiwade",
  url: "https://www.omrushikeshraiwade.space/",
};

export const COLLEGE = {
  name: "Chhatrapati Shivajiraje Mahavidyalaya",
  shortName: "CSM Udgir",
  city: "Udgir",
  trust: "Kisan Shikshan Prasarak Mandal",
  logo: "/clg-logo.png",
};
