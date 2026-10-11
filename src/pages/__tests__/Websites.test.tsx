import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import clientSites from "../../data/websites";
import Websites from "../Websites";

describe("Websites", () => {
  let container: HTMLDivElement;
  let root: Root;

  function renderAt(wide: boolean, onNavigate = vi.fn()) {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: wide, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    act(() => root.render(<Websites onNavigate={onNavigate} />));
    return onNavigate;
  }

  function click(label: string) {
    const button = [...container.querySelectorAll("button")].find((candidate) => candidate.textContent?.startsWith(label));
    if (!button) throw new Error(`Button not found: ${label}`);
    act(() => button.click());
  }

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      disconnect() {}
    });
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

  it("shows every site as a card on phones, linking public ones to their live copy", () => {
    renderAt(false);
    const cards = container.querySelectorAll("li");
    expect(cards).toHaveLength(clientSites.length);

    const links = [...container.querySelectorAll<HTMLAnchorElement>("a")].map((link) => link.href);
    for (const site of clientSites) {
      if (site.visibility === "public" && site.liveUrl) expect(links).toContain(site.liveUrl);
    }
  });

  it("gives a private site no media and turns its action into a preview request", () => {
    renderAt(false);
    const privateSite = clientSites.find((site) => site.visibility === "private");
    if (!privateSite) throw new Error("Missing private fixture");
    const card = [...container.querySelectorAll("li")].find((item) => item.textContent?.includes(privateSite.client));
    expect(card?.querySelector("img, video")).toBeNull();
    expect(card?.querySelector("a")).toBeNull();

    click("Ask for a preview");
    expect(container.querySelector("textarea")?.value).toContain(privateSite.client);
  });

  it("tunes the monitor from the guide on wide screens", () => {
    renderAt(true);
    const [first, second] = clientSites;
    expect(container.querySelector("[aria-live] h2")?.textContent).toBe(first.client);

    click(`04-2${second.client}`);
    expect(container.querySelector("[aria-live] h2")?.textContent).toBe(second.client);
  });

  it("ends on starting a project, with a way to the rest of the work", () => {
    const onNavigate = renderAt(false);
    click("See all my work");
    expect(onNavigate).toHaveBeenCalledWith("portfolio");

    click("Start a project");
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    act(() => form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(container.querySelector("[role=status]")?.textContent).toContain("nothing was sent");
  });
});
