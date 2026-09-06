import crypto from "crypto";

export const runtime = "nodejs";

/**
 * Verifies a Firebase ID token without needing the Admin SDK / a service
 * account, by asking Identity Toolkit to look the token up.
 */
async function isSignedInAdmin(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return false; // demo mode: nothing to verify against
  if (!idToken) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.users) && data.users.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!cloudName || !apiKey || !apiSecret) {
    // Demo mode - there is nothing stored in the cloud to remove.
    return Response.json({ ok: true, skipped: "cloudinary-not-configured" });
  }

  let publicId = null;
  let idToken = null;
  try {
    const body = await request.json();
    publicId = body?.publicId ?? null;
    idToken = body?.idToken ?? null;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof publicId !== "string" || !publicId) {
    return Response.json({ error: "publicId is required." }, { status: 400 });
  }

  // Only enforce sign-in when Firebase Auth is actually set up.
  if (firebaseKey && !(await isSignedInAdmin(idToken))) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const form = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: "POST", body: form }
    );
    const data = await res.json();
    return Response.json({ ok: data.result === "ok", result: data.result });
  } catch {
    return Response.json({ error: "Cloudinary request failed." }, { status: 502 });
  }
}
