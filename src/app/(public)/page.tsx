import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/public/course-card";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { getFeaturedCourses, getPublishedCourses, getSiteSettings } from "@/lib/data/public";

const CATEGORY_BLURBS = {
  SSC: "Secondary-level physics: motion, force, energy, waves.",
  HSC: "Higher-secondary physics with vectors and calculus.",
  ADVANCED: "University-level mechanics and modern physics.",
} as const;

export default async function HomePage() {
  const [settings, featured, courses] = await Promise.all([
    getSiteSettings(),
    getFeaturedCourses(),
    getPublishedCourses(),
  ]);

  return (
    <>
      {/* Hero — static for now; the animated version arrives in Phase 5. */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden border-b border-border/60"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,128,255,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.14),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 lg:py-36">
          <p className="font-mono text-sm text-accent">F = ma · E = mc² · ∇·E = ρ/ε₀</p>
          <h1
            id="hero-heading"
            className="mt-4 max-w-3xl text-4xl leading-tight font-bold sm:text-6xl"
          >
            Natural Philosophy with{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {settings.tutorName}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{settings.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              Browse courses <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-semibold transition hover:border-primary hover:text-primary"
            >
              Free resources
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-4 pt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 id="featured-heading" className="text-3xl font-bold">
              Featured courses
            </h2>
            <Link href="/courses" className="text-sm text-primary hover:underline">
              All courses →
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="levels-heading" className="mx-auto max-w-6xl px-4 pt-20">
        <h2 id="levels-heading" className="mb-8 text-3xl font-bold">
          Learn at your level
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {CATEGORIES.map((category) => {
            const count = courses.filter((c) => c.category === category).length;
            return (
              <li key={category}>
                <Link
                  href={`/courses?category=${category.toLowerCase()}`}
                  className="group block h-full rounded-2xl border border-border bg-surface p-6 transition hover:border-secondary/60"
                >
                  <p className="font-heading text-2xl font-bold group-hover:text-secondary">
                    {CATEGORY_LABELS[category]}
                  </p>
                  <p className="mt-2 text-sm text-muted">{CATEGORY_BLURBS[category]}</p>
                  <p className="mt-4 text-xs text-accent">
                    {count} {count === 1 ? "course" : "courses"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
