import { z } from "zod";
import { parseYouTubeId, youtubeWatchUrl } from "@/lib/youtube";
import { checkbox, optionalText, requiredText, slug } from "./fields";

export const INVALID_YOUTUBE_URL =
  "Not a valid YouTube video link. Paste a link like https://www.youtube.com/watch?v=… or https://youtu.be/…";

export const chapterSchema = z.object({
  title: requiredText("Title", 120),
  slug,
  description: optionalText("Description", 20_000),
  youtubeUrl: requiredText("YouTube URL", 500).transform((value, ctx) => {
    const id = parseYouTubeId(value);
    if (!id) {
      ctx.addIssue({ code: "custom", message: INVALID_YOUTUBE_URL });
      return z.NEVER;
    }
    return { id, url: youtubeWatchUrl(id) };
  }),
  isPublished: checkbox,
});

export type ChapterInput = z.infer<typeof chapterSchema>;
