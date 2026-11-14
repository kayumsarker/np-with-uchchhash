/**
 * Cache tags shared by public "use cache" reads (cacheTag) and admin mutations (updateTag).
 * Keep every tag string here so readers and writers can never drift apart.
 */
export const tags = {
  /** Any list of courses: home featured, /courses, sitemap. */
  courses: "courses",
  /** One course page plus all of its chapter pages. */
  course: (courseId: string) => `course:${courseId}`,
  /** Site settings: footer socials, about page, home hero text. */
  settings: "settings",
} as const;
