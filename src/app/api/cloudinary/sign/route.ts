import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { signUpload } from "@/lib/cloudinary";
import { UPLOAD_KIND_NAMES } from "@/lib/uploads";

const NO_STORE = { "Cache-Control": "no-store" };
const bodySchema = z.object({ kind: z.enum(UPLOAD_KIND_NAMES) });

/**
 * Returns a signature so the admin's browser can upload one file directly to
 * Cloudinary. Admin-only: proxy.ts does not cover /api, so this check is the guard.
 */
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return Response.json({ error: "Not signed in as admin." }, { status: 401, headers: NO_STORE });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400, headers: NO_STORE });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Unknown upload kind." }, { status: 400, headers: NO_STORE });
  }

  return Response.json(signUpload(parsed.data.kind), { headers: NO_STORE });
}
