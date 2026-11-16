import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";
import { checkbox, optionalText, publicId, requiredText } from "./fields";

export const RESOURCE_TYPES = ["PDF", "IMAGE", "LINK"] as const;

/** "" from a <select> placeholder → null. */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T, message: string) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .enum(values, { error: message })
      .optional()
      .transform((value) => value ?? null),
  );

export const resourceSchema = z
  .object({
    title: requiredText("Title", 160),
    description: optionalText("Description", 5_000),
    type: z.enum(RESOURCE_TYPES, { error: "Choose a type." }),
    linkUrl: z.string().trim().max(2_000, "Link is too long.").optional(),
    filePublicId: publicId,
    category: optionalEnum(CATEGORIES, "Choose a valid category."),
    chapterId: z
      .string()
      .trim()
      .max(64)
      .optional()
      .transform((value) => (value ? value : null)),
    isPublished: checkbox,
  })
  .transform(({ linkUrl, filePublicId, ...rest }, ctx) => {
    if (rest.type === "LINK") {
      let url: URL | null = null;
      try {
        url = linkUrl ? new URL(linkUrl) : null;
      } catch {
        // handled below
      }
      // Only http(s): blocks javascript:, data: and other dangerous schemes.
      if (!url || (url.protocol !== "https:" && url.protocol !== "http:")) {
        ctx.addIssue({
          code: "custom",
          path: ["linkUrl"],
          message: "Enter a full link starting with https://",
        });
        return z.NEVER;
      }
      return { ...rest, source: { type: "LINK" as const, url: url.toString() } };
    }
    if (!filePublicId) {
      ctx.addIssue({ code: "custom", path: ["filePublicId"], message: "Upload a file." });
      return z.NEVER;
    }
    return { ...rest, source: { type: rest.type, publicId: filePublicId } };
  });

export type ResourceInput = z.infer<typeof resourceSchema>;
