import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { HashRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import projects from "../../data/projects";
import usePortfolioNavigation from "../usePortfolioNavigation";

function NavigationProbe() {
  const navigation = usePortfolioNavigation();

  return (
    <div>
      <output data-testid="channel">{navigation.channel ?? "overview"}</output>
      <output data-testid="project">{navigation.project?.id ?? "none"}</output>
      <output data-testid="redirect">{navigation.redirectTo ?? "none"}</output>
      <button onClick={() => navigation.navigateToTV("home")}>Open profile</button>
      <button onClick={() => navigation.navigateToTV("portfolio")}>Open portfolio</button>
      <button onClick={() => navigation.navigateToTV("contact")}>Open contact</button>
      <button onClick={() => navigation.navigateToTV("constructor")}>Invalid target</button>
      <button onClick={() => navigation.openProject(projects[0])}>Open project</button>
      <button onClick={navigation.closeProject}>Close project</button>
      <button onClick={navigation.closeTV}>Close TV</button>
    </div>
  );
}

describe("usePortfolioNavigation", () => {
  let host: HTMLDivElement;
  let root: Root;
  let mounted = false;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    window.history.replaceState(null, "", "#/");
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    if (mounted) act(() => root.unmount());
    host.remove();
    mounted = false;
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
  });

  function mount() {
    act(() => root.render(<HashRouter><NavigationProbe /></HashRouter>));
    mounted = true;
  }

  function unmount() {
    act(() => root.unmount());
    mounted = false;
    root = createRoot(host);
  }

  function read(testId: string) {
    return host.querySelector(`[data-testid="${testId}"]`)?.textContent;
  }

  function click(label: string) {
    act(() => {
      [...host.querySelectorAll("button")].find((button) => button.textContent === label)?.click();
    });
  }

  async function traverse(direction: "back" | "forward") {
    await act(async () => {
      window.history[direction]();
      await new Promise((resolve) => window.setTimeout(resolve, 10));
    });
  }

  async function waitForHistory() {
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 10));
    });
  }

  it("derives the selected channel and project from hash URLs", () => {
    window.history.replaceState(null, "", `#/portfolio/${projects[0].id}`);
    mount();

    expect(read("channel")).toBe("portfolio");
    expect(read("project")).toBe(projects[0].id);
    expect(read("redirect")).toBe("none");
  });

  it("rejects inherited object properties as navigation targets", () => {
    mount();
    const historyLength = window.history.length;
    click("Invalid target");
    expect(window.location.hash).toBe("#/");
    expect(window.history.length).toBe(historyLength);
  });

  it("requests canonical redirects for aliases, unknown paths, and unknown projects", () => {
    window.history.replaceState(null, "", "#/home");
    mount();
    expect(read("channel")).toBe("home");
    expect(read("redirect")).toBe("/profile");

    unmount();
    window.history.replaceState(null, "", "#/portfolio/not-a-project");
    mount();
    expect(read("channel")).toBe("portfolio");
    expect(read("redirect")).toBe("/portfolio");

    unmount();
    window.history.replaceState(null, "", "#/missing");
    mount();
    expect(read("channel")).toBe("overview");
    expect(read("redirect")).toBe("/");
  });

  it("uses browser back and forward for tracked TV navigation without duplicate entries", async () => {
    mount();
    click("Open profile");
    expect(window.location.hash).toBe("#/profile");

    click("Open profile");
    await traverse("back");
    expect(window.location.hash).toBe("#/");
    expect(read("channel")).toBe("overview");

    await traverse("forward");
    expect(window.location.hash).toBe("#/profile");
    expect(read("channel")).toBe("home");

    click("Close TV");
    await waitForHistory();
    expect(window.location.hash).toBe("#/");
  });

  it("returns to the portfolio list after an in-app project open", async () => {
    window.history.replaceState(null, "", "#/portfolio");
    mount();

    click("Open project");
    expect(window.location.hash).toBe(`#/portfolio/${projects[0].id}`);
    expect(read("project")).toBe(projects[0].id);

    click("Close project");
    await waitForHistory();
    expect(window.location.hash).toBe("#/portfolio");
    expect(read("project")).toBe("none");
  });

  it("replaces direct deep links with close fallbacks", () => {
    window.history.replaceState(null, "", `#/portfolio/${projects[0].id}`);
    mount();
    click("Close project");
    expect(window.location.hash).toBe("#/portfolio");

    click("Open profile");
    click("Close TV");
    expect(window.location.hash).toBe("#/");
  });
});
