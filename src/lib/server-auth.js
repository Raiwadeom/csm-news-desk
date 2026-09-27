// Server-only: checks that a request comes from a real administrator.
//
// There is no Admin SDK / service account here, so both checks go through
// Google's REST APIs with the caller's own ID token:
//   1. Identity Toolkit confirms the token is genuine and gives the uid.
//   2. Firestore is asked for admins/{uid} *as that user*. The security
//      rules only let admins read that collection, so a 200 proves the
//      account is an admin - a merely signed-in account gets a 403.

export async function verifyAdmin(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;
  if (typeof idToken !== "string" || !idToken || idToken.length > 4096) return null;

  try {
    const lookup = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );
    if (!lookup.ok) return null;
    const uid = (await lookup.json())?.users?.[0]?.localId;
    if (typeof uid !== "string" || !/^[A-Za-z0-9]{1,128}$/.test(uid)) return null;

    const profile = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${uid}`,
      { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" }
    );
    return profile.ok ? uid : null;
  } catch {
    return null;
  }
}

/** Reads the bearer token from the Authorization header. */
export function bearerToken(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/);
  return match ? match[1] : null;
}

/** Rejects cross-site browser requests to our API routes. */
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches may omit it; the token still guards
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
