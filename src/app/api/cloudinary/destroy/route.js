import crypto from "crypto";
import { bearerToken, isSameOrigin, verifyAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // Demo mode - there is nothing stored in the cloud to remove.
    return Response.json({ ok: true, skipped: "cloudinary-not-configured" });
  }

  if (!isSameOrigin(request)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  let publicId = null;
  let idToken = bearerToken(request);
  try {
    const body = await request.json();
    publicId = body?.publicId ?? null;
    idToken = idToken || body?.idToken || null;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Only images the app itself uploaded may be removed.
  if (typeof publicId !== "string" || !/^csm-news\/[\w\-/]{1,200}$/.test(publicId)) {
    return Response.json({ error: "Invalid publicId." }, { status: 400 });
  }

  if (!(await verifyAdmin(idToken))) {
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
