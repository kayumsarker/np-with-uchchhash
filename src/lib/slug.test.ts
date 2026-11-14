import { describe, expect, it } from "vitest";
import { SLUG_MAX_LENGTH, SLUG_REGEX, slugify } from "./slug";

describe("slugify", () => {
  it.each([
    ["Motion", "motion"],
    ["Newton's Second Law", "newtons-second-law"],
    ["Newton’s Third Law", "newtons-third-law"],
    ["Position–Time Graphs", "position-time-graphs"],
    ["  Work, Energy & Power!  ", "work-energy-power"],
    ["F = ma", "f-ma"],
    ["Électricité", "electricite"],
    ["HSC 2nd Paper", "hsc-2nd-paper"],
    ["---", ""],
    ["গতি", ""],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("caps length without leaving a trailing hyphen", () => {
    const slug = slugify(`${"a".repeat(SLUG_MAX_LENGTH - 1)} bcd`);
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("always produces a valid slug when non-empty", () => {
    for (const title of ["A  B", "Vectors & Scalars", "x_y.z", "Ünïcödé"]) {
      expect(slugify(title)).toMatch(SLUG_REGEX);
    }
  });
});
