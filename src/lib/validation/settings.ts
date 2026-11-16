import { z } from "zod";
import { publicId, requiredText } from "./fields";

/** Optional https link whose host must belong to the given platform. Empty → null. */
const socialUrl = (platform: string, hosts: string[]) =>
  z
    .string()
    .trim()
    .max(500, `${platform} link is too long.`)
    .optional()
    .transform((value, ctx) => {
      if (!value) return null;
      let url: URL;
      try {
        url = new URL(value);
      } catch {
        ctx.addIssue({ code: "custom", message: `Enter a full link starting with https://` });
        return z.NEVER;
      }
      const host = url.hostname.toLowerCase().replace(/^(www|m)\./, "");
      if (url.protocol !== "https:" || !hosts.includes(host)) {
        ctx.addIssue({
          code: "custom",
          message: `Must be an https link to ${hosts.join(" or ")}.`,
        });
        return z.NEVER;
      }
      return url.toString();
    });

export const settingsSchema = z.object({
  tutorName: requiredText("Tutor name", 80),
  tagline: requiredText("Tagline", 160),
  aboutContent: requiredText("About content", 20_000),
  youtubeUrl: socialUrl("YouTube", ["youtube.com"]),
  facebookUrl: socialUrl("Facebook", ["facebook.com", "fb.com"]),
  instagramUrl: socialUrl("Instagram", ["instagram.com"]),
  photoPublicId: publicId,
});

export type SettingsInput = z.infer<typeof settingsSchema>;
