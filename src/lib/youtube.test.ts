import { describe, expect, it } from "vitest";
import { parseYouTubeId, youtubeThumbnailUrl, youtubeWatchUrl } from "./youtube";

const ID = "ihNZlp7iUHE";

describe("parseYouTubeId", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}`],
    [`http://www.youtube.com/watch?v=${ID}`],
    [`www.youtube.com/watch?v=${ID}`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`https://music.youtube.com/watch?v=${ID}`],
    [`https://www.youtube.com/watch?v=${ID}&t=42s`],
    [`https://www.youtube.com/watch?feature=share&v=${ID}&list=PL123&index=2`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=AbCdEf123&t=10`],
    [`youtu.be/${ID}`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://youtube.com/shorts/${ID}?feature=share`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/embed/${ID}?start=30&autoplay=1`],
    [`https://www.youtube-nocookie.com/embed/${ID}`],
    [`https://www.youtube.com/live/${ID}?si=xyz`],
    [`https://www.youtube.com/v/${ID}`],
    [`  https://youtu.be/${ID}  `],
    [ID],
  ])("parses %s", (input) => {
    expect(parseYouTubeId(input)).toBe(ID);
  });

  it.each([
    [""],
    ["   "],
    ["not a url"],
    ["https://www.youtube.com/"],
    ["https://www.youtube.com/watch"],
    ["https://www.youtube.com/watch?v="],
    ["https://www.youtube.com/watch?v=short"],
    ["https://www.youtube.com/watch?v=ihNZlp7iUHEextra"],
    ["https://www.youtube.com/channel/UC4a-Gbdw7vOaccHmFo40b9g"],
    ["https://www.youtube.com/playlist?list=PL123"],
    ["https://youtu.be/"],
    [`https://vimeo.com/${ID}`],
    [`https://evil.com/watch?v=${ID}`],
    [`https://youtube.com.evil.com/watch?v=${ID}`],
    [`javascript:alert(1)//youtube.com/watch?v=${ID}`],
    [`ftp://youtube.com/watch?v=${ID}`],
    ["ihNZlp7iUH!"],
  ])("rejects %s", (input) => {
    expect(parseYouTubeId(input)).toBeNull();
  });
});

describe("youtube URL helpers", () => {
  it("builds canonical watch and thumbnail URLs", () => {
    expect(youtubeWatchUrl(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`);
    expect(youtubeThumbnailUrl(ID)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  });
});
