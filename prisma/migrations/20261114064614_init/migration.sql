-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SSC', 'HSC', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'IMAGE', 'LINK');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailPublicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ResourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT,
    "category" "Category",
    "chapterId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "tutorName" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "aboutContent" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "youtubeUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_category_order_idx" ON "Course"("category", "order");

-- CreateIndex
CREATE INDEX "Chapter_courseId_order_idx" ON "Chapter"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_courseId_slug_key" ON "Chapter"("courseId", "slug");

-- CreateIndex
CREATE INDEX "Resource_chapterId_order_idx" ON "Resource"("chapterId", "order");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
