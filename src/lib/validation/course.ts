import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";
import { checkbox, publicId, requiredText, slug } from "./fields";

export const courseSchema = z.object({
  title: requiredText("Title", 120),
  slug,
  description: requiredText("Description", 20_000),
  category: z.enum(CATEGORIES, { error: "Choose a category." }),
  isPublished: checkbox,
  isFeatured: checkbox,
  thumbnailPublicId: publicId,
});

export type CourseInput = z.infer<typeof courseSchema>;
