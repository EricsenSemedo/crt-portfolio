import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import projects from "../../../data/projects";
import DescriptionChannel from "../DescriptionChannel";

describe("DescriptionChannel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
  });

  it("renders the required contribution before hackathon story steps", () => {
    const project = projects.find((candidate) => candidate.id === "shadi");
    if (!project) throw new Error("Missing SHADI fixture");

    act(() => root.render(<DescriptionChannel project={project} />));

    const content = container.textContent ?? "";
    const contributionIndex = content.indexOf(project.detailedDescription.contribution);
    const firstStoryIndex = content.indexOf(project.storySteps?.[0].description ?? "");
    expect(contributionIndex).toBeGreaterThanOrEqual(0);
    expect(contributionIndex).toBeLessThan(firstStoryIndex);
  });
});
