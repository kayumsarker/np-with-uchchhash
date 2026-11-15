import { describe, expect, it } from "vitest";
import { plainExcerpt } from "./text";

describe("plainExcerpt", () => {
  it("keeps hyphenated words and strips Markdown syntax", () => {
    expect(
      plainExcerpt(
        "University-level **classical** mechanics, see [notes](https://x.y) and `F = ma`.",
      ),
    ).toBe("University-level classical mechanics, see notes and F = ma.");
  });

  it("removes headings, list markers and images", () => {
    expect(plainExcerpt("# Title\n- one\n- two\n1. three\n![img](a.png)")).toBe(
      "Title one two three",
    );
  });

  it("caps length with an ellipsis", () => {
    const result = plainExcerpt("word ".repeat(100), 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result.endsWith("…")).toBe(true);
  });
});
