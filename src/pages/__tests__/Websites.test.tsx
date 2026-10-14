import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import clientSites from "../../data/websites";
import { INQUIRY_URL, type TurnstileApi } from "../../utils/inquiry";
import Websites from "../Websites";

describe("Websites", () => {
  let container: HTMLDivElement;
  let root: Root;
  let turnstile: { render: ReturnType<typeof vi.fn>; reset: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };

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

  async function openAndFillForm() {
    click("Start a project");
    await act(async () => {});
    const form = container.querySelector("form");
    if (!form) throw new Error("Form not found");
    for (const [name, value] of [["name", "Dana"], ["business", "Dana's Bakery"], ["message", "I need a site."], ["reply", "dana@example.com"]]) {
      (form.querySelector(`[name=${name}]`) as HTMLInputElement).value = value;
    }
    return form;
  }

  async function submit(form: HTMLFormElement) {
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
  }

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      disconnect() {}
    });
    // Turnstile passes straight away, as the managed widget does for most visitors.
    turnstile = {
      render: vi.fn((_container: HTMLElement, options: { callback: (token: string) => void }) => {
        options.callback("token-1");
        return "widget-1";
      }),
      reset: vi.fn(),
      remove: vi.fn(),
    };
    window.turnstile = turnstile as unknown as TurnstileApi;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete window.turnstile;
    vi.unstubAllGlobals();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
  });

  it("shows each client site as a card on phones, linking to its live copy", () => {
    renderAt(false);
    expect(clientSites.length).toBeGreaterThan(0);
    expect(container.querySelectorAll("li")).toHaveLength(clientSites.length);
    const links = [...container.querySelectorAll<HTMLAnchorElement>("a")].map((link) => link.href);
    for (const site of clientSites) {
      if (site.liveUrl) expect(links).toContain(site.liveUrl);
    }
  });

  it("tunes the monitor from the guide on wide screens", () => {
    renderAt(true);
    const [first, second] = clientSites;
    expect(container.querySelector("[aria-live] h2")?.textContent).toBe(first.project.title);
    click(`04-2${second.project.title}`);
    expect(container.querySelector("[aria-live] h2")?.textContent).toBe(second.project.title);
  });

  it("links on to the rest of the work", () => {
    const onNavigate = renderAt(false);
    click("See all my work");
    expect(onNavigate).toHaveBeenCalledWith("portfolio");
  });

  it("sends the form with its Turnstile token and confirms it arrived", async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    renderAt(false);
    await submit(await openAndFillForm());

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(INQUIRY_URL);
    expect(JSON.parse(init.body as string)).toMatchObject({ name: "Dana", reply: "dana@example.com", turnstileToken: "token-1", website: "" });
    expect(container.querySelector("[role=status]")?.textContent).toContain("in my inbox");
  });

  it("offers another try and LinkedIn when the send fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: false, error: "send" }, { status: 502 })));
    renderAt(false);
    await submit(await openAndFillForm());

    expect(container.querySelector("[role=alert]")?.textContent).toContain("didn't send");
    expect(container.querySelector("[role=alert] a")?.getAttribute("href")).toContain("linkedin.com");
    expect(turnstile.reset).toHaveBeenCalledWith("widget-1");
  });
});
