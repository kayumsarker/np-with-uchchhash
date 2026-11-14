import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Counts />
      </Suspense>
    </>
  );
}

async function Counts() {
  await requireAdmin();

  const [courses, publishedCourses, chapters, publishedChapters, resources, publishedResources] =
    await Promise.all([
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.chapter.count(),
      db.chapter.count({ where: { isPublished: true } }),
      db.resource.count(),
      db.resource.count({ where: { isPublished: true } }),
    ]);

  const cards = [
    { label: "Courses", total: courses, published: publishedCourses },
    { label: "Chapters", total: chapters, published: publishedChapters },
    { label: "Resources", total: resources, published: publishedResources },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-surface p-5">
          <dt className="text-sm text-muted">{card.label}</dt>
          <dd className="mt-1 font-heading text-4xl font-bold">{card.total}</dd>
          <dd className="mt-1 text-sm text-muted">
            <span className="text-accent">{card.published}</span> published
          </dd>
        </div>
      ))}
    </dl>
  );
}
