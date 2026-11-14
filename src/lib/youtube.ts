const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** Path prefixes that are followed by the video ID, e.g. /shorts/ID. */
const ID_PATH_PREFIXES = ["shorts", "embed", "live", "v", "e"];

/**
 * Extracts the 11-character video ID from a YouTube URL (or a bare ID).
 * Supports watch, youtu.be, shorts, embed, live, nocookie and extra query params
 * (e.g. &t=30s, &list=..., ?si=...). Returns null for anything else.
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  let candidate: string | null | undefined = null;
  if (host === "youtu.be" || host === "www.youtu.be") {
    candidate = segments[0];
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (segments[0] === "watch") {
      candidate = url.searchParams.get("v");
    } else if (segments.length >= 2 && ID_PATH_PREFIXES.includes(segments[0])) {
      candidate = segments[1];
    }
  }

  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

/** Canonical watch URL (drops tracking/playlist params). */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** 480×360 thumbnail, available for every public video. */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
