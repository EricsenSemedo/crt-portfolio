import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { applyTheme, getInitialTheme } from "../themeUtils";

describe("applyTheme", () => {
  let root: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    root = document.documentElement;
    root.classList.remove("light", "theme-transition");
  });

  afterEach(() => {
    vi.useRealTimers();
    root.classList.remove("light", "theme-transition");
  });

  it("adds .light class when theme is 'light'", () => {
    applyTheme("light");

    expect(root.classList.contains("light")).toBe(true);
  });

  it("removes .light class when theme is 'dark'", () => {
    root.classList.add("light");
    applyTheme("dark");

    expect(root.classList.contains("light")).toBe(false);
  });

  it("adds .theme-transition class during theme switch", () => {
    applyTheme("light");

    expect(root.classList.contains("theme-transition")).toBe(true);
  });

  it("removes .theme-transition after transitionend fires on root", () => {
    applyTheme("light");

    expect(root.classList.contains("theme-transition")).toBe(true);

    // Simulate transitionend firing on the root element
    const event = new Event("transitionend");
    Object.defineProperty(event, "target", { value: root });
    root.dispatchEvent(event);

    expect(root.classList.contains("theme-transition")).toBe(false);
  });

  it("ignores transitionend events from child elements", () => {
    applyTheme("light");

    // Simulate transitionend from a child (target !== root)
    const child = document.createElement("div");
    root.appendChild(child);
    const event = new Event("transitionend", { bubbles: true });
    child.dispatchEvent(event);

    // theme-transition should still be present
    expect(root.classList.contains("theme-transition")).toBe(true);

    root.removeChild(child);
  });

  it("removes .theme-transition via fallback timeout if transitionend never fires", () => {
    applyTheme("light");

    expect(root.classList.contains("theme-transition")).toBe(true);

    // Advance past the 400ms fallback
    vi.advanceTimersByTime(400);

    expect(root.classList.contains("theme-transition")).toBe(false);
  });

  it("cleanup runs exactly once when transitionend fires before fallback", () => {
    applyTheme("light");

    // Fire transitionend
    const event = new Event("transitionend");
    Object.defineProperty(event, "target", { value: root });
    root.dispatchEvent(event);

    expect(root.classList.contains("theme-transition")).toBe(false);

    // Advance past fallback -- should not throw or re-add anything
    vi.advanceTimersByTime(400);

    expect(root.classList.contains("theme-transition")).toBe(false);
  });

  it("cleanup runs exactly once when fallback fires before transitionend", () => {
    applyTheme("light");

    // Let fallback fire first
    vi.advanceTimersByTime(400);

    expect(root.classList.contains("theme-transition")).toBe(false);

    // Now fire transitionend -- should be a no-op (listener was removed)
    const event = new Event("transitionend");
    Object.defineProperty(event, "target", { value: root });
    root.dispatchEvent(event);

    expect(root.classList.contains("theme-transition")).toBe(false);
  });

  it("removes transitionend listener after cleanup", () => {
    const removeListenerSpy = vi.spyOn(root, "removeEventListener");

    applyTheme("light");

    const event = new Event("transitionend");
    Object.defineProperty(event, "target", { value: root });
    root.dispatchEvent(event);

    expect(removeListenerSpy).toHaveBeenCalledWith(
      "transitionend",
      expect.any(Function),
    );

    removeListenerSpy.mockRestore();
  });
});

describe("getInitialTheme", () => {
  const originalLocalStorage = globalThis.localStorage;

  function mockLocalStorage(data: Record<string, string> = {}) {
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => data[key] ?? null,
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  }

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it("returns 'dark' when localStorage has 'dark'", () => {
    mockLocalStorage({ "crt-portfolio-theme": "dark" });
    expect(getInitialTheme()).toBe("dark");
  });

  it("returns 'light' when localStorage has 'light'", () => {
    mockLocalStorage({ "crt-portfolio-theme": "light" });
    expect(getInitialTheme()).toBe("light");
  });

  it("falls back to OS preference when localStorage is empty", () => {
    mockLocalStorage({});
    // Mock matchMedia to return dark preference
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(getInitialTheme()).toBe("dark");
  });

  it("falls back to light when OS prefers light", () => {
    mockLocalStorage({});
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(getInitialTheme()).toBe("light");
  });

  it("ignores invalid localStorage values", () => {
    mockLocalStorage({ "crt-portfolio-theme": "invalid" });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(getInitialTheme()).toBe("dark");
  });
});
