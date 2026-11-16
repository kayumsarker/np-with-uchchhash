"use server";

import { refresh, updateTag } from "next/cache";
import { failure, success, validationFailure, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { cleanupOldAsset, resolveAssetChange } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { formDataToObject } from "@/lib/validation/fields";
import { settingsSchema } from "@/lib/validation/settings";

export async function updateSettings(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const { photoPublicId, ...input } = parsed.data;

  const existing = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { photoPublicId: true },
  });
  const current = existing?.photoPublicId ?? null;
  const photo = await resolveAssetChange("tutorPhoto", photoPublicId, current);
  if (!photo.ok) return failure(photo.error, { photoPublicId: [photo.error] });

  const photoData =
    photo.change.type === "set"
      ? { photoUrl: photo.change.asset.url, photoPublicId: photo.change.asset.publicId }
      : photo.change.type === "remove"
        ? { photoUrl: null, photoPublicId: null }
        : {};

  // Single row (id = 1). Upsert so it also works on a fresh, unseeded database.
  await db.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...input, ...photoData },
    update: { ...input, ...photoData },
  });

  updateTag(tags.settings);
  refresh();
  const warning = await cleanupOldAsset(photo.change, current);
  return success("Settings saved.", undefined, warning);
}
