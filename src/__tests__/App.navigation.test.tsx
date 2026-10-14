import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PortfolioChannelId } from "../data/channels";
import App from "../App";
import { navigateHistory } from "../testUtils/history";

type StageProps = {
  onSelect: (id: PortfolioChannelId) => void;
  requestedChannel?: PortfolioChannelId | null;
  instantFocus?: boolean;
  onOverviewComplete?: () => void;
  onRequestedFocusComplete?: (id: PortfolioChannelId) => void;
};

type OverlayProps = {
  children?: ReactNode;
  onClose?: () => void;
  onExitComplete?: () => void;
  selectedItem: { id: PortfolioChannelId } | null;
};

let latestStage: StageProps | null = null;
let latestOverlay: OverlayProps | null = null;

vi.mock("../components/ThreeCRTStage", () => ({
  default: (props: StageProps) => {
    latestStage = props;
    return <div data-testid="stage" data-requested-channel={props.requestedChannel ?? "overview"} />;
  },
}));

vi.mock("../components/TVZoomOverlay", () => ({
  default: (props: OverlayProps) => {
    latestOverlay = props;
    return (
      <section data-testid="tv-overlay" data-channel={props.selectedItem?.id ?? "overview"}>
        <button onClick={props.onClose}>Close TV</button>
        {props.children}
      </section>
    );
  },
}));

vi.mock("../components/portfolio", () => ({
  ProjectShelves: ({ onOpen }: { onOpen: (project: { id: string }) => void }) => (
    <button onClick={() => onOpen({ id: "pullworth" })}>Open pullworth</button>
  ),
  ProjectDetailView: ({ project, onClose }: { project: { id: string; title: string }; onClose: () => void }) => (
    <section role="dialog" aria-label={project.title}>
      <output data-testid="project-id">{project.id}</output>
      <button onClick={onClose}>Back to project gallery</button>
    </section>
  ),
}));

describe("App hash navigation", () => {
  let host: HTMLDivElement;
  let root: Root;
  let mounted = false;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    window.history.replaceState(null, "", "#/");
    latestStage = null;
    latestOverlay = null;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
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

  async function mount(path = "#/") {
    window.history.replaceState(null, "", path);
    act(() => root.render(<App />));
    await act(async () => {
      await vi.dynamicImportSettled();
      await Promise.resolve();
    });
    mounted = true;
    if (path === "#/") completeOverview();
  }

  function click(label: string) {
    act(() => {
      const button = [...host.querySelectorAll("button")].find((candidate) => candidate.textContent === label);
      if (!button) throw new Error(`Button not found: ${label}`);
      button.click();
    });
  }

  async function traverse(direction: "back" | "forward") {
    await navigateHistory(() => window.history[direction]());
  }

  function completeOverlayExit() {
    act(() => latestOverlay?.onExitComplete?.());
  }

  function completeOverview() {
    act(() => latestStage?.onOverviewComplete?.());
  }

  function completeFocus(id: PortfolioChannelId) {
    act(() => latestStage?.onRequestedFocusComplete?.(id));
  }

  async function selectFromStage(id: PortfolioChannelId) {
    await act(async () => {
      if (!latestStage) throw new Error("Stage did not mount");
      latestStage.onSelect(id);
      await Promise.resolve();
    });
  }

  async function mountRoomWhenIdle() {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      await vi.dynamicImportSettled();
    });
  }

  function overlayChannel() {
    return host.querySelector("[data-testid=tv-overlay]")?.getAttribute("data-channel");
  }

  it("uses browser Back and Forward for overview and profile while retaining the scene", async () => {
    await mount();
    const initialStage = host.querySelector("[data-testid=stage]");

    await selectFromStage("home");
    expect(window.location.hash).toBe("#/profile");
    expect(latestStage?.requestedChannel).toBe("home");
    completeFocus("home");
    expect(overlayChannel()).toBe("home");

    await traverse("back");
    expect(window.location.hash).toBe("#/");
    expect(overlayChannel()).toBe("overview");
    completeOverlayExit();
    completeOverview();

    await traverse("forward");
    expect(window.location.hash).toBe("#/profile");
    expect(latestStage?.requestedChannel).toBe("home");
    completeFocus("home");
    expect(overlayChannel()).toBe("home");
    expect(host.querySelector("[data-testid=stage]")).toBe(initialStage);
  });

  it("keeps the gallery open when browser Back closes a project, then returns to overview", async () => {
    await mount();
    await selectFromStage("portfolio");
    expect(latestStage?.requestedChannel).toBe("portfolio");
    completeFocus("portfolio");
    click("Open pullworth");
    expect(window.location.hash).toBe("#/portfolio/pullworth");
    expect(host.querySelector("[data-testid=project-id]")?.textContent).toBe("pullworth");

    await traverse("back");
    expect(window.location.hash).toBe("#/portfolio");
    expect(host.querySelector("[data-testid=project-id]")).toBeNull();
    expect(overlayChannel()).toBe("portfolio");

    await traverse("back");
    expect(window.location.hash).toBe("#/");
    expect(overlayChannel()).toBe("overview");
    completeOverlayExit();
    expect(latestStage?.requestedChannel).toBeNull();
  });

  it("opens a direct project URL at once, loads the room behind it, and its in-page close returns to the gallery", async () => {
    await mount("#/portfolio/pullworth");
    expect(overlayChannel()).toBe("portfolio");
    expect(host.querySelector("[data-testid=project-id]")?.textContent).toBe("pullworth");
    expect(latestStage).toBeNull();

    await mountRoomWhenIdle();
    expect(latestStage?.requestedChannel).toBe("portfolio");
    expect(latestStage?.instantFocus).toBe(true);
    completeFocus("portfolio");
    expect(overlayChannel()).toBe("portfolio");

    click("Back to project gallery");
    expect(window.location.hash).toBe("#/portfolio");
    expect(host.querySelector("[data-testid=project-id]")).toBeNull();
  });

  it("canonicalizes an unknown hash without remounting the scene during a profile exit", async () => {
    await mount();
    await selectFromStage("home");
    completeFocus("home");
    const profileStage = host.querySelector("[data-testid=stage]");

    await navigateHistory(() => {
      window.location.hash = "#/missing";
    });

    expect(window.location.hash).toBe("#/");
    expect(host.querySelector("[data-testid=stage]")).toBe(profileStage);
    expect(overlayChannel()).toBe("overview");
    completeOverlayExit();
    completeOverview();
    expect(latestStage?.requestedChannel).toBeNull();
  });

  it("pulls back to the room when a shared link is closed before the room has loaded", async () => {
    await mount("#/profile");
    expect(overlayChannel()).toBe("home");
    expect(latestStage).toBeNull();

    // Nothing to go back to, so Close replaces the entry instead of traversing history.
    click("Close TV");
    expect(window.location.hash).toBe("#/");
    completeOverlayExit();
    await mountRoomWhenIdle();
    expect(latestStage?.requestedChannel).toBeNull();
    completeOverview();
    expect(overlayChannel()).toBe("overview");
  });

  it("opens a channel picked on the loading screen without waiting for the room", async () => {
    window.history.replaceState(null, "", "#/");
    act(() => root.render(<App />));
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    mounted = true;
    expect(overlayChannel()).toBe("overview");

    await selectFromStage("contact");
    expect(window.location.hash).toBe("#/contact");
    expect(overlayChannel()).toBe("contact");
    expect(latestStage?.requestedChannel).toBe("contact");
  });

  it("ignores a stale focus completion when the target changes during a transition", async () => {
    await mount();
    await selectFromStage("portfolio");
    expect(latestStage?.requestedChannel).toBe("portfolio");

    await navigateHistory(() => {
      window.location.hash = "#/profile";
    });
    expect(latestStage?.requestedChannel).toBe("home");
    completeFocus("portfolio");
    expect(overlayChannel()).toBe("overview");

    completeFocus("home");
    expect(overlayChannel()).toBe("home");
  });

  it("opens a shared Websites link at once and keeps the room at its overview behind it", async () => {
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      disconnect() {}
    });
    await mount("#/websites");
    expect(overlayChannel()).toBe("websites");
    expect(host.querySelector("h1")?.textContent).toContain("Websites");

    await mountRoomWhenIdle();
    expect(latestStage?.requestedChannel).toBeNull();

    click("Close TV");
    expect(window.location.hash).toBe("#/");
    completeOverlayExit();
    completeOverview();
    expect(overlayChannel()).toBe("overview");
    vi.unstubAllGlobals();
  });

  it("powers Websites on over the room without zooming into a set", async () => {
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      disconnect() {}
    });
    await mount();
    await navigateHistory(() => {
      window.location.hash = "#/websites";
    });
    expect(overlayChannel()).toBe("websites");
    expect(latestStage?.requestedChannel).toBeNull();
    vi.unstubAllGlobals();
  });

  it("flips channels inside an open set, and browser Back flips back", async () => {
    await mount();
    await selectFromStage("home");
    completeFocus("home");
    click("View Projects");
    expect(window.location.hash).toBe("#/portfolio");
    expect(overlayChannel()).toBe("portfolio");
    expect(latestStage?.requestedChannel).toBe("home");

    await traverse("back");
    expect(window.location.hash).toBe("#/profile");
    expect(overlayChannel()).toBe("home");

    await navigateHistory(() => click("Close TV"));
    expect(window.location.hash).toBe("#/");
    expect(overlayChannel()).toBe("overview");
    completeOverlayExit();
    expect(latestStage?.requestedChannel).toBeNull();
  });
});
