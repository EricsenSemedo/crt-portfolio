import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import projects from "../../../data/projects";
import DemoChannel from "../DemoChannel";

vi.mock("../../StaticNoise", () => ({
  default: function StaticNoiseMock() {
    return null;
  },
}));

describe("DemoChannel", () => {
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

  it("does not opt any demo content into scroll-linked reveal effects", () => {
    const project = projects.find((candidate) => candidate.id === "pullworth");
    if (!project) throw new Error("Missing PullWorth fixture");

    act(() => root.render(<DemoChannel project={project} />));

    expect(container.querySelector("[data-crt-scroll-container]")).toBeNull();
    expect(container.querySelector(".crt-scroll-reveal")).toBeNull();
  });
  it("offers a retry when the active image fails", () => {
    const project = { ...projects[0], media: [{ type: "image" as const, src: "/missing.png", alt: "Preview" }] };
    act(() => root.render(<DemoChannel project={project} />));
    act(() => container.querySelector("img")!.dispatchEvent(new Event("error")));
    expect(container.querySelector('[role="status"]')?.textContent).toContain("could not be loaded");
    const retry = [...container.querySelectorAll("button")].find((button) => button.textContent === "Retry media")!;
    act(() => retry.click());
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/missing.png");
    act(() => container.querySelector("img")!.dispatchEvent(new Event("error")));
    act(() => root.render(<DemoChannel project={{ ...project, id: "another-project" }} />));
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/missing.png");
  });

});
