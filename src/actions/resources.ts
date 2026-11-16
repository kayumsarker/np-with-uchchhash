"use server";

import { refresh, updateTag } from "next/cache";
import type { ResourceType } from "@/generated/prisma/enums";
import { failure, success, validationFailure, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import {
  CLEANUP_WARNING,
  cleanupOldAsset,
  deleteAsset,
  resolveAssetChange,
  type AssetChange,
} from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { isNotFound } from "@/lib/prisma-errors";
import type { UploadKind } from "@/lib/uploads";
import { direction, formDataToObject, id as idSchema } from "@/lib/validation/fields";
import { resourceSchema, type ResourceInput } from "@/lib/validation/resource";

const NOT_FOUND = "Resource not found. It may have been deleted — reload the page.";

const KIND: Record<Exclude<ResourceType, "LINK">, UploadKind> = {
  PDF: "resourcePdf",
  IMAGE: "resourceImage",
};

/** /resources and every chapter page read the "resources" tag. */
function revalidateResources() {
  updateTag(tags.resources);
  refresh();
}

type Existing = { type: ResourceType; url: string; cloudinaryPublicId: string | null };

/**
 * Turns the validated form into DB fields (url + cloudinaryPublicId),
 * verifying a newly uploaded file. `existing` is null when creating.
 */
async function resolveSource(
  input: ResourceInput,
  existing: Existing | null,
): Promise<
  | { ok: true; url: string; publicId: string | null; change: AssetChange }
  | { ok: false; state: ActionState }
> {
  const current = existing?.cloudinaryPublicId ?? null;
  const { source } = input;

  if (source.type === "LINK") {
    const change: AssetChange = current ? { type: "remove" } : { type: "keep" };
    return { ok: true, url: source.url, publicId: null, change };
  }

  // Same file but a different type (e.g. PDF → IMAGE) must be re-verified.
  const sameType = existing?.type === source.type;
  const resolved = await resolveAssetChange(
    KIND[source.type],
    source.publicId,
    sameType ? current : null,
  );
  if (!resolved.ok) {
    return { ok: false, state: failure(resolved.error, { filePublicId: [resolved.error] }) };
  }
  const { change } = resolved;
  if (change.type === "set") {
    return { ok: true, url: change.asset.url, publicId: change.asset.publicId, change };
  }
  // "keep" (remove is impossible here: the schema requires a file).
  return { ok: true, url: existing!.url, publicId: current, change };
}

async function chapterExists(chapterId: string | null) {
  if (!chapterId) return true;
  return Boolean(await db.chapter.findUnique({ where: { id: chapterId }, select: { id: true } }));
}

const CHAPTER_GONE = { chapterId: ["That chapter no longer exists. Choose another."] };

export async function createResource(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = resourceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const input = parsed.data;

  if (!(await chapterExists(input.chapterId))) return failure("Chapter not found.", CHAPTER_GONE);

  const source = await resolveSource(input, null);
  if (!source.ok) return source.state;

  const { _max } = await db.resource.aggregate({ _max: { order: true } });
  await db.resource.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      category: input.category,
      chapterId: input.chapterId,
      isPublished: input.isPublished,
      url: source.url,
      cloudinaryPublicId: source.publicId,
      order: (_max.order ?? -1) + 1,
    },
  });

  revalidateResources();
  return success("Resource created.", "/admin/resources");
}

export async function updateResource(resourceId: string, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(resourceId);

  const parsed = resourceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const input = parsed.data;

  const existing = await db.resource.findUnique({
    where: { id },
    select: { type: true, url: true, cloudinaryPublicId: true },
  });
  if (!existing) return failure(NOT_FOUND);
  if (!(await chapterExists(input.chapterId))) return failure("Chapter not found.", CHAPTER_GONE);

  const source = await resolveSource(input, existing);
  if (!source.ok) return source.state;

  try {
    await db.resource.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        type: input.type,
        category: input.category,
        chapterId: input.chapterId,
        isPublished: input.isPublished,
        url: source.url,
        cloudinaryPublicId: source.publicId,
      },
    });
  } catch (error) {
    if (isNotFound(error)) return failure(NOT_FOUND);
    throw error;
  }

  revalidateResources();
  // Delete the old file only if it is no longer the stored one.
  const oldFile =
    existing.cloudinaryPublicId !== source.publicId ? existing.cloudinaryPublicId : null;
  const warning = await cleanupOldAsset(source.change, oldFile);
  return success("Resource saved.", undefined, warning);
}

export async function deleteResource(resourceId: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(resourceId);

  let cloudinaryPublicId: string | null;
  try {
    ({ cloudinaryPublicId } = await db.resource.delete({
      where: { id },
      select: { cloudinaryPublicId: true },
    }));
  } catch (error) {
    if (isNotFound(error)) return failure(NOT_FOUND);
    throw error;
  }

  revalidateResources();
  const removed = await deleteAsset(cloudinaryPublicId);
  return success("Resource deleted.", undefined, removed ? undefined : CLEANUP_WARNING);
}

export async function toggleResourcePublished(resourceId: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(resourceId);

  const resource = await db.resource.findUnique({ where: { id }, select: { isPublished: true } });
  if (!resource) return failure(NOT_FOUND);

  const isPublished = !resource.isPublished;
  await db.resource.update({ where: { id }, data: { isPublished } });

  revalidateResources();
  return success(isPublished ? "Resource published." : "Resource set to draft.");
}

/** One global order (used by /resources and chapter pages). Swap, then renumber 0..n. */
export async function moveResource(resourceId: string, dir: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(resourceId);
  const step = direction.parse(dir) === "up" ? -1 : 1;

  const all = await db.resource.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  const ids = all.map((r) => r.id);
  const from = ids.indexOf(id);
  if (from === -1) return failure(NOT_FOUND);
  const to = from + step;
  if (to < 0 || to >= ids.length) return success("Already at the edge.");

  [ids[from], ids[to]] = [ids[to], ids[from]];
  await db.$transaction(
    ids.map((otherId, order) => db.resource.update({ where: { id: otherId }, data: { order } })),
  );

  revalidateResources();
  return success("Order updated.");
}
