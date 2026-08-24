import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useScrollMotion from "../useScrollMotion";

const lenisMocks = vi.hoisted(() => ({
  construct: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("lenis", () => ({
  default: class MockLenis {
    constructor() {
      lenisMocks.construct();
    }

    on() {}
    raf() {}
    destroy() {
      lenisMocks.destroy();
    }
  },
}));

function ScrollProbe({ initializationDelay = 0 }: { initializationDelay?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollMotion(rootRef, "portfolio", initializationDelay);

  return (
    <div ref={rootRef}>
      <div className="crt-page">
        <div><div className="crt-scroll-reveal">Row</div></div>
      </div>
    </div>
  );
}

describe("useScrollMotion", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mounted: boolean;
  let mediaListeners: Map<string, Set<() => void>>;
  let mediaMatches: Map<string, boolean>;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    lenisMocks.construct.mockClear();
    lenisMocks.destroy.mockClear();
    mediaListeners = new Map();
    mediaMatches = new Map([
      ["(pointer: fine)", true],
      ["(hover: hover)", true],
      ["(prefers-reduced-motion: reduce)", false],
    ]);
    vi.stubGlobal("matchMedia", vi.fn((query: string): MediaQueryList => {
      const listeners = mediaListeners.get(query) ?? new Set<() => void>();
      mediaListeners.set(query, listeners);
      return {
        get matches() { return mediaMatches.get(query) ?? false; },
        media: query,
        onchange: null,
        addEventListener: (_event, listener) => listeners.add(listener as () => void),
        removeEventListener: (_event, listener) => listeners.delete(listener as () => void),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => (
      window.setTimeout(() => callback(performance.now()), 16)
    ));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id));
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: 0 });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    mounted = false;
  });

  afterEach(() => {
    if (mounted) act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
  });

  it("creates desktop Lenis surfaces, discovers a nested channel, and cleans both up", async () => {
    act(() => root.render(<ScrollProbe />));
    mounted = true;
    expect(lenisMocks.construct).toHaveBeenCalledTimes(1);

    const nested = document.createElement("div");
    nested.dataset.crtScrollContainer = "";
    nested.appendChild(document.createElement("div"));
    container.querySelector(".crt-page")?.appendChild(nested);
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });

    expect(lenisMocks.construct).toHaveBeenCalledTimes(2);
    act(() => root.unmount());
    mounted = false;
    expect(lenisMocks.destroy).toHaveBeenCalledTimes(2);
  });

  it("destroys desktop Lenis when reduced motion is enabled", () => {
    act(() => root.render(<ScrollProbe />));
    mounted = true;
    expect(lenisMocks.construct).toHaveBeenCalledTimes(1);

    mediaMatches.set("(prefers-reduced-motion: reduce)", true);
    act(() => mediaListeners.get("(prefers-reduced-motion: reduce)")?.forEach((listener) => listener()));
    expect(lenisMocks.destroy).toHaveBeenCalledTimes(1);
  });

  it("does not construct Lenis for a touch device", () => {
    Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: 5 });
    act(() => root.render(<ScrollProbe />));
    mounted = true;
    expect(lenisMocks.construct).not.toHaveBeenCalled();
  });

  it("keeps rows sharp when a TV page has no scroll range", () => {
    act(() => root.render(<ScrollProbe />));
    mounted = true;
    const page = container.querySelector<HTMLElement>(".crt-page")!;
    const row = container.querySelector<HTMLElement>(".crt-scroll-reveal")!;
    Object.defineProperty(page, "clientHeight", { configurable: true, value: 800 });
    Object.defineProperty(page, "scrollHeight", { configurable: true, value: 800 });
    page.getBoundingClientRect = () => ({ top: 0, left: 0, right: 800, bottom: 800, width: 800, height: 800, x: 0, y: 0, toJSON() {} });
    row.getBoundingClientRect = () => ({ top: 0, left: 0, right: 800, bottom: 80, width: 800, height: 80, x: 0, y: 0, toJSON() {} });

    act(() => window.dispatchEvent(new Event("resize")));

    expect(row.style.getPropertyValue("--crt-reveal-opacity")).toBe("1.000");
    expect(row.style.getPropertyValue("--crt-reveal-blur")).toBe("0.00px");
  });

  it("waits for the inbound CRT animation before measuring or starting Lenis", () => {
    act(() => root.render(<ScrollProbe initializationDelay={460} />));
    mounted = true;
    expect(lenisMocks.construct).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(459));
    expect(lenisMocks.construct).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(lenisMocks.construct).toHaveBeenCalledTimes(1);
  });
});
