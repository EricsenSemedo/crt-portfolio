import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useScrambleText from "../useScrambleText";

function ScrambleProbe() {
  const label = useScrambleText("PROJECTS", false, { autoPlay: "touch", delay: 100 });
  return <span>{label.visibleLabel}</span>;
}

describe("useScrambleText touch autoplay", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn((query: string): MediaQueryList => ({
      matches: query.includes("hover: none"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => (
      window.setTimeout(() => callback(performance.now()), 16)
    ));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id));
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<ScrambleProbe />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
  });

  it("scrambles after the screen-entry delay and resolves to the original label", () => {
    expect(container.textContent).toBe("PROJECTS");

    act(() => vi.advanceTimersByTime(132));
    expect(container.textContent).not.toBe("PROJECTS");

    act(() => vi.advanceTimersByTime(300));
    expect(container.textContent).toBe("PROJECTS");
  });
});
