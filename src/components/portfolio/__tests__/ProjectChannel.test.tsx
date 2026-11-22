import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import projects from "../../../data/projects";
import ProjectChannel from "../ProjectChannel";

describe("ProjectChannel", () => {
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

    act(() => root.render(<ProjectChannel project={project} />));

    const content = container.textContent ?? "";
    const contributionIndex = content.indexOf(project.detailedDescription.contribution);
    const firstStoryIndex = content.indexOf(project.storySteps?.[0].description ?? "");
    expect(contributionIndex).toBeGreaterThanOrEqual(0);
    expect(contributionIndex).toBeLessThan(firstStoryIndex);
  });

  it("shows the demo first, then the story, on one scrolling page", () => {
    const project = projects.find((candidate) => candidate.id === "toonsync");
    if (!project) throw new Error("Missing ToonSync fixture");

    act(() => root.render(<ProjectChannel project={project} />));

    const page = container.querySelector("[data-crt-scroll-container]");
    const media = container.querySelector("[data-carry-target]");
    const story = [...container.querySelectorAll("h2")].find((heading) => heading.textContent === "What I owned");
    expect(page).not.toBeNull();
    expect(media && story && media.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // The carried screen lands on the media, so it never waits on an entrance of its own.
    expect(media?.closest("[data-enter], .crt-scroll-reveal")).toBeNull();
    expect(container.textContent).toContain(project.detailedDescription.highlights[0]);
  });

  it("offers the next channel and the contact call at the end", () => {
    const [project, nextProject] = projects;
    const onNextProject = vi.fn();
    const onContact = vi.fn();

    act(() => root.render(<ProjectChannel project={project} nextProject={nextProject} onNextProject={onNextProject} onContact={onContact} />));

    const buttons = [...container.querySelectorAll("footer button")];
    act(() => (buttons.find((button) => button.textContent?.includes(nextProject.title)) as HTMLButtonElement).click());
    act(() => (buttons.find((button) => button.textContent?.includes("Get In Touch")) as HTMLButtonElement).click());
    expect(onNextProject).toHaveBeenCalledOnce();
    expect(onContact).toHaveBeenCalledOnce();
  });
  it("puts Hire me for a website before Visit site on client website pages only", () => {
    const onHire = vi.fn();
    for (const id of ["edgewood-remodeling", "btb-creative-vision", "luis-rosa"]) {
      const project = projects.find((candidate) => candidate.id === id);
      if (!project) throw new Error(`Missing ${id} fixture`);
      act(() => root.render(<ProjectChannel project={project} onHire={onHire} />));
      const block = [...container.querySelectorAll("dt")].find((term) => term.textContent === "See more")?.nextElementSibling;
      const hire = block?.querySelector("button");
      const visit = [...(block?.querySelectorAll("a") ?? [])].find((link) => link.textContent?.startsWith("Visit site"));
      expect(hire?.textContent).toBe("Hire me for a website");
      expect(visit).toBeDefined();
      expect(hire && visit && hire.compareDocumentPosition(visit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      act(() => hire?.click());
    }
    expect(onHire).toHaveBeenCalledTimes(3);

    const other = projects.find((candidate) => candidate.id === "toonsync");
    if (!other) throw new Error("Missing ToonSync fixture");
    act(() => root.render(<ProjectChannel project={other} onHire={onHire} />));
    expect(container.textContent).not.toContain("Hire me for a website");
  });
});
