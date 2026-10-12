import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { browseGroups, browseLineup, browseMedia, channelNumber } from "../browse";
import projects from "../projects";

function publicFile(url: string) {
  return url.replace(/^\/crt-portfolio\//, "public/");
}

describe("project shelves", () => {
  it("puts every project on exactly one shelf", () => {
    expect(browseLineup.map((project) => project.id).sort()).toEqual(projects.map((project) => project.id).sort());
    expect(new Set(browseLineup).size).toBe(browseLineup.length);
    expect(browseGroups.every((group) => group.projects.length > 0)).toBe(true);
  });

  it("has a poster, and a clip where one is listed, for every set on the air", () => {
    for (const project of browseLineup) {
      const media = browseMedia(project);
      if (!media) continue;
      expect(existsSync(publicFile(media.poster)), media.poster).toBe(true);
      if (media.clip) expect(existsSync(publicFile(media.clip)), media.clip).toBe(true);
    }
  });

  it("numbers channels across shelves", () => {
    expect(channelNumber(browseLineup[0])).toBe("01");
    expect(channelNumber(browseLineup[browseLineup.length - 1])).toBe(String(browseLineup.length).padStart(2, "0"));
  });
});
