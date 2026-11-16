import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseTabs, CourseTabsFromUrl, type CourseGroup } from "@/components/public/course-tabs";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { getPublishedCourses } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Courses",
  description: "Free physics video courses for SSC, HSC and advanced learners.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();
  const groups: CourseGroup[] = CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    courses: courses.filter((c) => c.category === category),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-bold">Courses</h1>
      <p className="mt-3 mb-10 max-w-2xl text-muted">
        Every course is free. Pick your level and start with the first lesson.
      </p>
      {/* Static shell shows the first tab; ?category= is applied in the browser. */}
      <Suspense fallback={<CourseTabs groups={groups} initial={groups[0].category} />}>
        <CourseTabsFromUrl groups={groups} />
      </Suspense>
    </div>
  );
}
