import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Category, ResourceType } from "@/generated/prisma/enums";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

/**
 * Public, cached reads. Everything here only returns PUBLISHED content:
 * a chapter is public only when it AND its course are published.
 * Admin mutations invalidate these via updateTag (see src/lib/cache-tags.ts),
 * so a long cache life is safe.
 */

export type SiteSettingsData = {
  tutorName: string;
  tagline: string;
  aboutContent: string;
  photoUrl: string | null;
  youtubeUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

const DEFAULT_SETTINGS: SiteSettingsData = {
  tutorName: "Uchchhash",
  tagline: "Free physics lessons, from first principles.",
  aboutContent: "",
  photoUrl: null,
  youtubeUrl: null,
  facebookUrl: null,
  instagramUrl: null,
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.settings);

  const settings = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: {
      tutorName: true,
      tagline: true,
      aboutContent: true,
      photoUrl: true,
      youtubeUrl: true,
      facebookUrl: true,
      instagramUrl: true,
    },
  });
  return settings ?? DEFAULT_SETTINGS;
}

export type CourseCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  chapterCount: number;
  /** YouTube ID of the first chapter, used as the card image. */
  coverYoutubeId: string | null;
};

const courseCardSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  category: true,
  chapters: {
    where: { isPublished: true },
    orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }],
    select: { youtubeId: true },
  },
};

type CourseCardRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  chapters: { youtubeId: string }[];
};

function toCard({ chapters, ...course }: CourseCardRow): CourseCard {
  return {
    ...course,
    chapterCount: chapters.length,
    coverYoutubeId: chapters[0]?.youtubeId ?? null,
  };
}

export async function getPublishedCourses(): Promise<CourseCard[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.courses);

  const courses = await db.course.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: courseCardSelect,
  });
  return courses.map(toCard);
}

export async function getFeaturedCourses(): Promise<CourseCard[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.courses);

  const courses = await db.course.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    select: courseCardSelect,
  });
  return courses.map(toCard);
}

export type ChapterSummary = {
  id: string;
  title: string;
  slug: string;
  youtubeId: string;
};

export type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  chapters: ChapterSummary[];
};

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  "use cache";
  cacheLife("max");
  // "courses" also covers slug changes and publish toggles of this course.
  cacheTag(tags.courses);

  const course = await db.course.findFirst({
    where: { slug, isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      chapters: {
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, title: true, slug: true, youtubeId: true },
      },
    },
  });
  if (course) cacheTag(tags.course(course.id));
  return course;
}

export type ResourceItem = {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  url: string;
  category: Category | null;
  /** Set only when the chapter (and its course) are public. */
  chapter: { title: string; slug: string; courseSlug: string; courseTitle: string } | null;
};

export type ChapterDetail = {
  course: CourseDetail;
  chapter: ChapterSummary & { description: string | null };
  index: number;
  prev: ChapterSummary | null;
  next: ChapterSummary | null;
  resources: ResourceItem[];
};

export async function getChapter(
  courseSlug: string,
  chapterSlug: string,
): Promise<ChapterDetail | null> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.courses, tags.resources);

  const course = await getCourse(courseSlug);
  if (!course) return null;
  cacheTag(tags.course(course.id));

  const index = course.chapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) return null;

  const chapter = await db.chapter.findUnique({
    where: { id: course.chapters[index].id },
    select: {
      id: true,
      title: true,
      slug: true,
      youtubeId: true,
      description: true,
      resources: {
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          url: true,
          category: true,
        },
      },
    },
  });
  if (!chapter) return null;

  const { resources, ...rest } = chapter;
  return {
    course,
    chapter: rest,
    index,
    prev: course.chapters[index - 1] ?? null,
    next: course.chapters[index + 1] ?? null,
    resources: resources.map((r) => ({ ...r, chapter: null })),
  };
}

export async function getPublishedResources(): Promise<ResourceItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.resources, tags.courses);

  const resources = await db.resource.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      url: true,
      category: true,
      chapter: {
        select: {
          title: true,
          slug: true,
          isPublished: true,
          course: { select: { title: true, slug: true, isPublished: true, category: true } },
        },
      },
    },
  });

  return resources.map(({ chapter, ...resource }) => {
    const isPublic = chapter?.isPublished && chapter.course.isPublished;
    return {
      ...resource,
      // A chapter resource without its own category inherits the course's category.
      category: resource.category ?? (isPublic ? chapter.course.category : null),
      chapter: isPublic
        ? {
            title: chapter.title,
            slug: chapter.slug,
            courseSlug: chapter.course.slug,
            courseTitle: chapter.course.title,
          }
        : null,
    };
  });
}

/** For generateStaticParams. */
export async function getPublishedChapterParams() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.courses);

  const courses = await getPublishedCourses();
  const details = await Promise.all(courses.map((c) => getCourse(c.slug)));
  return details.flatMap((course) =>
    course ? course.chapters.map((ch) => ({ slug: course.slug, chapter: ch.slug })) : [],
  );
}
