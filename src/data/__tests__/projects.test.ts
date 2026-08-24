import { describe, expect, it } from "vitest";
import projects from "../projects";

function projectById(id: string) {
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) throw new Error(`Missing project fixture: ${id}`);
  return project;
}

describe("game project media", () => {
  it("presents Don't Get Caught as a video and accurate gameplay screenshot carousel", () => {
    const project = projectById("dont-get-caught");

    expect(project.image).toBe("/crt-portfolio/projects/dont-get-caught-preview.webp");
    expect(project.media?.map((item) => item.src)).toEqual([
      "/crt-portfolio/projects/dont_get_caught_demo.mp4",
      "/crt-portfolio/projects/dont-get-caught-preview.webp",
    ]);
  });

  it("presents Grow Your Plant as a demo and two screenshot carousel", () => {
    const project = projectById("grow-your-plant");

    expect(project.image).toBe("/crt-portfolio/projects/grow-your-plant-garden.webp");
    expect(project.media?.map((item) => item.src)).toEqual([
      "/crt-portfolio/projects/grow-your-plant-demo.mp4",
      "/crt-portfolio/projects/grow-your-plant-garden.webp",
      "/crt-portfolio/projects/grow-your-plant-upgrades.webp",
    ]);
  });
});
