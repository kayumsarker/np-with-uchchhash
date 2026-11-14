import type { Category } from "@/generated/prisma/enums";

export const CATEGORIES = ["SSC", "HSC", "ADVANCED"] as const satisfies readonly Category[];

export const CATEGORY_LABELS: Record<Category, string> = {
  SSC: "SSC",
  HSC: "HSC",
  ADVANCED: "Advanced",
};
