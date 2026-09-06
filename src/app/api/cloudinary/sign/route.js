import crypto from "crypto";

export const runtime = "nodejs";

/**
 * Mints a short-lived signature so the browser can upload straight to
 * Cloudinary. The API secret stays on the server.
 */
export async function POST(request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      { error: "Cloudinary is not configured on the server." },
      { status: 500 }
    );
  }

  let folder = "csm-news";
  try {
    const body = await request.json();
    if (typeof body?.folder === "string" && /^[\w\-/]{1,80}$/.test(body.folder)) {
      folder = body.folder;
    }
  } catch {
    // keep the default folder
  }

  const timestamp = Math.round(Date.now() / 1000);
  // Params must be signed in alphabetical order, secret appended at the end.
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return Response.json({ signature, timestamp, apiKey, cloudName, folder });
}
