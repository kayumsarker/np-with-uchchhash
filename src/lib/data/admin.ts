import "server-only";
import type { ChapterOptionGroup } from "@/components/admin/resource-form";
import { db } from "@/lib/db";

/** Uncached admin reads. Callers must have called requireAdmin() first. */

/** All chapters (drafts too) grouped by course, for the resource form's chapter picker. */
export async function getChapterGroups(): Promise<ChapterOptionGroup[]> {
  const courses = await db.course.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      chapters: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, title: true },
      },
    },
  });
  return courses
    .filter((course) => course.chapters.length > 0)
    .map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      chapters: course.chapters,
    }));
}
