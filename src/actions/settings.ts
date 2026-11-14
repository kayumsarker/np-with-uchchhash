"use server";

import { refresh, updateTag } from "next/cache";
import { success, validationFailure, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { formDataToObject } from "@/lib/validation/fields";
import { settingsSchema } from "@/lib/validation/settings";

export async function updateSettings(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  // Single row (id = 1). Upsert so it also works on a fresh, unseeded database.
  // TODO(Phase 6): tutor photo upload via Cloudinary.
  await db.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
  });

  updateTag(tags.settings);
  refresh();
  return success("Settings saved.");
}
