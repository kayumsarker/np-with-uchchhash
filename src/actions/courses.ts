"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import type { Category } from "@/generated/prisma/enums";
import { failure, success, validationFailure, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { isNotFound, isUniqueViolation } from "@/lib/prisma-errors";
import { slugify } from "@/lib/slug";
import { courseSchema } from "@/lib/validation/course";
import { direction, formDataToObject, id as idSchema } from "@/lib/validation/fields";

const SLUG_TAKEN = { slug: ["Another course already uses this slug."] };
const NOT_FOUND = "Course not found. It may have been deleted — reload the page.";

/** Public pages showing this course update immediately; admin page re-renders. */
function revalidateCourse(courseId: string) {
  updateTag(tags.courses);
  updateTag(tags.course(courseId));
  refresh();
}

async function nextOrder(category: Category) {
  const { _max } = await db.course.aggregate({ where: { category }, _max: { order: true } });
  return (_max.order ?? -1) + 1;
}

function parseCourseForm(formData: FormData) {
  const raw = formDataToObject(formData);
  if (!raw.slug?.trim()) raw.slug = slugify(raw.title ?? "");
  return courseSchema.safeParse(raw);
}

export async function createCourse(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseCourseForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);
  const input = parsed.data;

  try {
    const course = await db.course.create({
      data: { ...input, order: await nextOrder(input.category) },
      select: { id: true },
    });
    revalidateCourse(course.id);
    return success("Course created. Now add chapters.", `/admin/courses/${course.id}`);
  } catch (error) {
    if (isUniqueViolation(error)) return failure("That slug is already taken.", SLUG_TAKEN);
    throw error;
  }
}

export async function updateCourse(courseId: string, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(courseId);

  const parsed = parseCourseForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);
  const input = parsed.data;

  const existing = await db.course.findUnique({ where: { id }, select: { category: true } });
  if (!existing) return failure(NOT_FOUND);

  try {
    await db.course.update({
      where: { id },
      data: {
        ...input,
        // Moving to another category puts the course at the end of that category.
        ...(existing.category !== input.category && { order: await nextOrder(input.category) }),
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return failure("That slug is already taken.", SLUG_TAKEN);
    if (isNotFound(error)) return failure(NOT_FOUND);
    throw error;
  }

  revalidateCourse(id);
  return success("Course saved.");
}

export async function deleteCourse(courseId: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(courseId);

  // Chapters cascade-delete; their resources become standalone (chapterId → null).
  // TODO(Phase 6): delete the course thumbnail from Cloudinary.
  try {
    await db.course.delete({ where: { id } });
  } catch (error) {
    if (isNotFound(error)) return failure(NOT_FOUND);
    throw error;
  }

  revalidateCourse(id);
  return success("Course deleted.", "/admin/courses");
}

const toggleField = z.enum(["isPublished", "isFeatured"]);

export async function toggleCourse(
  courseId: string,
  field: z.infer<typeof toggleField>,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(courseId);
  const key = toggleField.parse(field);

  const course = await db.course.findUnique({
    where: { id },
    select: { isPublished: true, isFeatured: true },
  });
  if (!course) return failure(NOT_FOUND);
  const value = !course[key];

  await db.course.update({ where: { id }, data: { [key]: value } });
  revalidateCourse(id);

  if (key === "isPublished") return success(value ? "Course published." : "Course set to draft.");
  return success(value ? "Course featured on home page." : "Course removed from featured.");
}

/** Swap with the neighbour in the same category, then renumber 0..n so orders stay clean. */
export async function moveCourse(courseId: string, dir: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.parse(courseId);
  const step = direction.parse(dir) === "up" ? -1 : 1;

  const course = await db.course.findUnique({ where: { id }, select: { category: true } });
  if (!course) return failure(NOT_FOUND);

  const siblings = await db.course.findMany({
    where: { category: course.category },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const ids = siblings.map((s) => s.id);
  const from = ids.indexOf(id);
  const to = from + step;
  if (to < 0 || to >= ids.length) return success("Already at the edge.");

  [ids[from], ids[to]] = [ids[to], ids[from]];
  await db.$transaction(
    ids.map((siblingId, order) => db.course.update({ where: { id: siblingId }, data: { order } })),
  );

  updateTag(tags.courses);
  refresh();
  return success("Order updated.");
}
