/**
 * Sample content seed. Safe to re-run: upserts by slug, replaces sample resources.
 * Run: npx prisma db seed
 *
 * All YouTube IDs below were verified via YouTube oEmbed (Khan Academy, CrashCourse, Stanford).
 * Every sample description starts with "Sample content" so it's easy to find and delete later.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Category } from "../src/generated/prisma/client";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const yt = (id: string) => ({ youtubeId: id, youtubeUrl: `https://www.youtube.com/watch?v=${id}` });

type SeedCourse = {
  title: string;
  slug: string;
  category: Category;
  order: number;
  isFeatured: boolean;
  description: string;
  chapters: { title: string; slug: string; description: string; youtubeId: string }[];
};

const courses: SeedCourse[] = [
  {
    title: "Motion",
    slug: "ssc-motion",
    category: "SSC",
    order: 0,
    isFeatured: true,
    description:
      "Sample content. Learn how objects move: **distance, displacement, speed and velocity**, and how to read motion graphs.",
    chapters: [
      {
        title: "Vectors and Scalars",
        slug: "vectors-and-scalars",
        description: "Sample content. Distance vs displacement, speed vs velocity.",
        youtubeId: "ihNZlp7iUHE",
      },
      {
        title: "Position–Time Graphs",
        slug: "position-time-graphs",
        description: "Sample content. Reading motion from a position vs time graph.",
        youtubeId: "GtoamALPOP0",
      },
      {
        title: "Motion in a Straight Line",
        slug: "motion-in-a-straight-line",
        description: "Sample content. Putting it together for one-dimensional motion.",
        youtubeId: "ZM8ECpBuQYE",
      },
    ],
  },
  {
    title: "Force",
    slug: "ssc-force",
    category: "SSC",
    order: 1,
    isFeatured: false,
    description: "Sample content. Newton's laws of motion and friction, explained from scratch.",
    chapters: [
      {
        title: "Newton's First Law",
        slug: "newtons-first-law",
        description: "Sample content. Inertia and balanced forces.",
        youtubeId: "D1NubiWCpQg",
      },
      {
        title: "Newton's Second Law",
        slug: "newtons-second-law",
        description: "Sample content. `F = ma` and what it really means.",
        youtubeId: "ou9YMWlJgkE",
      },
      {
        title: "Friction",
        slug: "friction",
        description: "Sample content. Static and kinetic friction.",
        youtubeId: "fo_pmp5rtzo",
      },
    ],
  },
  {
    title: "Vectors and Calculus Tools",
    slug: "hsc-vectors",
    category: "HSC",
    order: 0,
    isFeatured: true,
    description: "Sample content. The mathematical tools of HSC physics: vectors and derivatives.",
    chapters: [
      {
        title: "Vectors and 2D Motion",
        slug: "vectors-and-2d-motion",
        description: "Sample content. Components, addition and projectile basics.",
        youtubeId: "w3BhzYI6zXU",
      },
      {
        title: "Derivatives in Physics",
        slug: "derivatives-in-physics",
        description: "Sample content. Velocity and acceleration as rates of change.",
        youtubeId: "ObHJJYvu3RE",
      },
    ],
  },
  {
    title: "Newtonian Mechanics",
    slug: "hsc-newtonian-mechanics",
    category: "HSC",
    order: 1,
    isFeatured: false,
    description: "Sample content. Newton's laws applied, including circular motion.",
    chapters: [
      {
        title: "Newton's Laws",
        slug: "newtons-laws",
        description: "Sample content. All three laws with examples.",
        youtubeId: "kKKM8Y-u7ds",
      },
      {
        title: "Uniform Circular Motion",
        slug: "uniform-circular-motion",
        description: "Sample content. Centripetal acceleration and force.",
        youtubeId: "bpFK2VCRHUs",
      },
    ],
  },
  {
    title: "Classical Mechanics",
    slug: "advanced-classical-mechanics",
    category: "ADVANCED",
    order: 0,
    isFeatured: true,
    description:
      "Sample content. University-level classical mechanics — the theoretical minimum, following Stanford's lectures.",
    chapters: [
      {
        title: "Introduction to Classical Mechanics",
        slug: "introduction",
        description:
          "Sample content. State spaces, laws of motion, and the mathematics behind physics.",
        youtubeId: "ApUFtLCrU90",
      },
      {
        title: "Modern Physics: Lecture 1",
        slug: "modern-physics-lecture-1",
        description: "Sample content. An alternative first lecture on classical mechanics.",
        youtubeId: "pyX8kQ-JzHI",
      },
    ],
  },
];

const SAMPLE_RESOURCE_URLS = [
  "https://www.khanacademy.org/science/physics",
  "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/",
  "https://openstax.org/details/books/university-physics-volume-1",
  "https://www.khanacademy.org/science/physics/one-dimensional-motion",
];

async function main() {
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tutorName: "Uchchhash",
      tagline: "Physics, from first principles.",
      aboutContent:
        "Sample content. Replace this bio from **Admin → Settings**.\n\nUchchhash teaches physics for SSC, HSC and beyond — all free.",
    },
  });

  for (const c of courses) {
    const { chapters, ...data } = c;
    const course = await db.course.upsert({
      where: { slug: c.slug },
      update: { ...data, isPublished: true },
      create: { ...data, isPublished: true },
    });

    for (const [i, ch] of chapters.entries()) {
      const { youtubeId, ...chData } = ch;
      const fields = { ...chData, ...yt(youtubeId), order: i, isPublished: true };
      await db.chapter.upsert({
        where: { courseId_slug: { courseId: course.id, slug: ch.slug } },
        update: fields,
        create: { ...fields, courseId: course.id },
      });
    }
  }

  // Resources have no natural unique key: replace the sample set each run.
  await db.resource.deleteMany({ where: { url: { in: SAMPLE_RESOURCE_URLS } } });

  const motionCh1 = await db.chapter.findFirstOrThrow({
    where: { slug: "vectors-and-scalars", course: { slug: "ssc-motion" } },
  });

  await db.resource.createMany({
    data: [
      {
        title: "Khan Academy Physics",
        description: "Sample content. Free practice exercises and articles.",
        type: "LINK",
        url: SAMPLE_RESOURCE_URLS[0],
        order: 0,
        isPublished: true,
      },
      {
        title: "MIT OCW 8.01SC Classical Mechanics",
        description: "Sample content. Full MIT course with problem sets.",
        type: "LINK",
        url: SAMPLE_RESOURCE_URLS[1],
        category: "ADVANCED",
        order: 1,
        isPublished: true,
      },
      {
        title: "OpenStax University Physics Vol. 1",
        description: "Sample content. Free, peer-reviewed textbook.",
        type: "LINK",
        url: SAMPLE_RESOURCE_URLS[2],
        category: "HSC",
        order: 2,
        isPublished: true,
      },
      {
        title: "One-Dimensional Motion Practice",
        description: "Sample content. Exercises for this chapter.",
        type: "LINK",
        url: SAMPLE_RESOURCE_URLS[3],
        category: "SSC",
        chapterId: motionCh1.id,
        order: 0,
        isPublished: true,
      },
    ],
  });

  const counts = {
    courses: await db.course.count(),
    chapters: await db.chapter.count(),
    resources: await db.resource.count(),
    settings: await db.siteSettings.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
