import { z } from "zod";
import { SLUG_MAX_LENGTH, SLUG_REGEX } from "@/lib/slug";

/** Converts FormData to a plain object of strings (files are ignored). */
export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

/** HTML checkbox: "on" when ticked, absent when not. */
export const checkbox = z.preprocess((value) => value === "on" || value === "true", z.boolean());

export const requiredText = (label: string, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be at most ${max} characters.`);

/** Empty string → null. */
export const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters.`)
    .optional()
    .transform((value) => (value ? value : null));

export const slug = z
  .string({ error: "Slug is required." })
  .trim()
  .toLowerCase()
  .min(1, "Slug is required (use letters a–z or numbers).")
  .max(SLUG_MAX_LENGTH, `Slug must be at most ${SLUG_MAX_LENGTH} characters.`)
  .regex(SLUG_REGEX, "Use lowercase letters, numbers and single hyphens only (e.g. newtons-laws).");

/** IDs and other values arriving as bound action arguments — never trust them blindly. */
export const id = z.string().min(1).max(64);
export const direction = z.enum(["up", "down"]);
export type Direction = z.infer<typeof direction>;
