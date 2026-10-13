import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CRTLoadingScreen from "../CRTLoadingScreen";

describe("CRTLoadingScreen", () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  });

  it("shows the room and the name at once, with channels that open straight away", () => {
    const onOpen = vi.fn();
    act(() => root.render(<CRTLoadingScreen settled={2} total={7} onOpen={onOpen} />));

    expect(host.querySelector("img")?.getAttribute("src")).toContain("room/overview-wide.jpg");
    expect(host.textContent).toContain("Ericsen Semedo");
    act(() => [...host.querySelectorAll("nav button")].find((button) => button.textContent?.includes("Projects"))!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onOpen).toHaveBeenCalledWith("portfolio");
  });

  it("fades out once the room is live, dropping its controls", () => {
    const onFaded = vi.fn();
    act(() => root.render(<CRTLoadingScreen ready onOpen={vi.fn()} onFaded={onFaded} />));

    const screen = host.querySelector(".crt-loading-screen")!;
    expect(screen.classList.contains("is-ready")).toBe(true);
    expect(host.querySelector("nav")).toBeNull();
    expect(host.querySelector('[role="progressbar"]')).toBeNull();
    act(() => screen.dispatchEvent(new Event("transitionend", { bubbles: true })));
    expect(onFaded).toHaveBeenCalledOnce();
  });
});
