"use server";

import { refresh, updateTag } from "next/cache";
import { failure, success, validationFailure, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { isNotFound, isUniqueViolation } from "@/lib/prisma-errors";
import { slugify } from "@/lib/slug";
import { chapterSchema } from "@/lib/validation/chapter";
import { direction, formDataToObject, id as idSchema } from "@/lib/validation/fields";

const SLUG_TAKEN = { slug: ["Another chapter in this course already uses this slug."] };
const NOT_FOUND = "Chapter not found. It may have been deleted — reload the page.";

/** Chapter pages are tagged with their course; course lists may show chapter counts. */
function revalidateChapters(courseId: string) {
  updateTag(tags.courses);
  updateTag(tags.course(courseId));
  refresh();
}

function parseChapterForm(formData: FormData) {
  const raw = formDataToObject(formData);
  if (!raw.slug?.trim()) raw.slug = slugify(raw.title ?? "");
  return chapterSchema.safeParse(raw);
}

export async function createChapter(courseId: string, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parentId = idSchema.parse(courseId);

  const parsed = parseChapterForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);
  const { youtubeUrl, ...input } = parsed.data;

  const course = await db.course.findUnique({ where: { id: parentId }, select: { id: true } });
  if (!course) return failure("Course not found. It may have been deleted.");

  const { _max } = await db.chapter.aggregate({
    where: { courseId: parentId },
    _max: { order: true },
  });

  try {
    await db.chapter.create({
      data: {
        ...input,
        courseId: parentId,
        youtubeUrl: youtubeUrl.url,
        youtubeId: youtubeUrl.id,
        order: (_max.order ?? -1) + 1,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return failure("That slug is already taken.", SLUG_TAKEN);
    throw error;
  }

  revalidateChapters(parentId);
  return success("Chapter created.", `/admin/courses/${parentId}`);
}

export async function updateChapter(chapterId: string, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(chapterId);

  const parsed = parseChapterForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);
  const { youtubeUrl, ...input } = parsed.data;

  let courseId: string;
  try {
    ({ courseId } = await db.chapter.update({
      where: { id },
      data: { ...input, youtubeUrl: youtubeUrl.url, youtubeId: youtubeUrl.id },
      select: { courseId: true },
    }));
  } catch (error) {
    if (isUniqueViolation(error)) return failure("That slug is already taken.", SLUG_TAKEN);
    if (isNotFound(error)) return failure(NOT_FOUND);
    throw error;
  }

  revalidateChapters(courseId);
  return success("Chapter saved.");
}

export async function deleteChapter(chapterId: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(chapterId);

  // Resources attached to this chapter stay as standalone resources (onDelete: SetNull).
  let courseId: string;
  try {
    ({ courseId } = await db.chapter.delete({ where: { id }, select: { courseId: true } }));
  } catch (error) {
    if (isNotFound(error)) return failure(NOT_FOUND);
    throw error;
  }

  revalidateChapters(courseId);
  return success("Chapter deleted.");
}

export async function toggleChapterPublished(chapterId: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(chapterId);

  const chapter = await db.chapter.findUnique({
    where: { id },
    select: { isPublished: true, courseId: true },
  });
  if (!chapter) return failure(NOT_FOUND);

  const isPublished = !chapter.isPublished;
  await db.chapter.update({ where: { id }, data: { isPublished } });

  revalidateChapters(chapter.courseId);
  return success(isPublished ? "Chapter published." : "Chapter set to draft.");
}

/** Swap with the neighbour in the same course, then renumber 0..n. */
export async function moveChapter(chapterId: string, dir: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(chapterId);
  const step = direction.parse(dir) === "up" ? -1 : 1;

  const chapter = await db.chapter.findUnique({ where: { id }, select: { courseId: true } });
  if (!chapter) return failure(NOT_FOUND);

  const siblings = await db.chapter.findMany({
    where: { courseId: chapter.courseId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const ids = siblings.map((s) => s.id);
  const from = ids.indexOf(id);
  const to = from + step;
  if (to < 0 || to >= ids.length) return success("Already at the edge.");

  [ids[from], ids[to]] = [ids[to], ids[from]];
  await db.$transaction(
    ids.map((siblingId, order) => db.chapter.update({ where: { id: siblingId }, data: { order } })),
  );

  revalidateChapters(chapter.courseId);
  return success("Order updated.");
}
