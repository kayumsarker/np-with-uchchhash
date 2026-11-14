import type { Metadata } from "next";
import { Suspense } from "react";
import { createCourse } from "@/actions/courses";
import { BackLink } from "@/components/admin/back-link";
import { CourseForm } from "@/components/admin/course-form";
import { cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New course" };

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/courses">All courses</BackLink>
      <h1 className="mb-6 text-3xl font-bold">New course</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <NewCourseForm />
      </Suspense>
    </div>
  );
}

async function NewCourseForm() {
  await requireAdmin();
  return (
    <div className={`${cardClass} p-5 sm:p-6`}>
      <CourseForm action={createCourse} />
    </div>
  );
}
