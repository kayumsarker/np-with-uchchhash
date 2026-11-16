import type { MetadataRoute } from "next";
import { getPublishedChapterParams, getPublishedCourses } from "@/lib/data/public";
import { SITE_URL } from "@/lib/site";

/** Published pages only. Cached reads → regenerated when admin changes courses. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, chapters] = await Promise.all([
    getPublishedCourses(),
    getPublishedChapterParams(),
  ]);

  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    priority,
  });

  return [
    page("/", 1),
    page("/courses", 0.9),
    page("/resources", 0.8),
    page("/about", 0.5),
    ...courses.map((c) => page(`/courses/${c.slug}`, 0.8)),
    ...chapters.map((c) => page(`/courses/${c.slug}/${c.chapter}`, 0.7)),
  ];
}
