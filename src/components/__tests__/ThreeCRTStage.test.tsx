import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ThreeCRTStage from "../ThreeCRTStage";
import { createPortfolioScene } from "../../three/createPortfolioScene";

vi.mock("../../three/createPortfolioScene", () => ({ createPortfolioScene: vi.fn() }));
let root: Root;
let host: HTMLDivElement;
let controller: ReturnType<typeof createPortfolioScene>;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  controller = {
    ready: Promise.resolve(),
    canvas: document.createElement("canvas"), resize: vi.fn(), render: vi.fn(),
    pick: vi.fn(), activateAt: vi.fn(), setParallax: vi.fn(), setHovered: vi.fn(),
    focus: vi.fn().mockResolvedValue(undefined), reset: vi.fn().mockResolvedValue(undefined),
    transitionScreen: vi.fn().mockResolvedValue("completed"), setScreenEffectActive: vi.fn(), dispose: vi.fn(),
  };
  vi.mocked(createPortfolioScene).mockReturnValue(controller);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
});
it("stops rendering covered content and resumes without recreating the scene", async () => {
  await act(async () => root.render(<ThreeCRTStage onSelect={vi.fn()} />));
  act(() => vi.advanceTimersByTime(50));
  expect(controller.render).toHaveBeenCalled();
  await act(async () => root.render(<ThreeCRTStage onSelect={vi.fn()} paused />));
  vi.mocked(controller.render).mockClear();
  act(() => vi.advanceTimersByTime(100));
  expect(controller.render).not.toHaveBeenCalled();
  await act(async () => root.render(<ThreeCRTStage onSelect={vi.fn()} />));
  act(() => vi.advanceTimersByTime(50));
  expect(controller.render).toHaveBeenCalled();
  expect(createPortfolioScene).toHaveBeenCalledOnce();
});
it.each(["initialization", "context loss"])("keeps section navigation usable after %s failure", async (failure) => {
  const select = vi.fn();
  if (failure === "initialization") vi.mocked(createPortfolioScene).mockImplementationOnce(() => { throw new Error("No WebGL"); });
  await act(async () => root.render(<ThreeCRTStage onSelect={select} />));
  if (failure === "context loss") act(() => controller.canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  expect(host.querySelector(".is-unavailable")).not.toBeNull();
  act(() => host.querySelector("button")!.click());
  expect(select).toHaveBeenCalledWith("home");
});
it("does not continue a focus transition after unmount", async () => {
  let finish!: () => void;
  vi.mocked(controller.focus).mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
  await act(async () => root.render(<ThreeCRTStage onSelect={vi.fn()} />));
  act(() => host.querySelector("button")!.click());
  act(() => root.unmount());
  root = createRoot(host);
  await act(async () => finish());
  expect(controller.transitionScreen).not.toHaveBeenCalled();
});

it.each(["focus", "screen"])("ignores an older requested channel while its %s transition finishes", async (phase) => {
  const complete = vi.fn();
  const select = vi.fn();
  let finish!: () => void;
  if (phase === "focus") {
    vi.mocked(controller.focus).mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
  } else {
    vi.mocked(controller.transitionScreen).mockImplementationOnce(() => new Promise((resolve) => { finish = () => resolve("completed"); }));
  }
  await act(async () => root.render(<ThreeCRTStage onSelect={select} requestedChannel="home" onRequestedFocusComplete={complete} />));
  await act(async () => root.render(<ThreeCRTStage onSelect={select} requestedChannel="portfolio" onRequestedFocusComplete={complete} />));
  await act(async () => finish());
  expect(controller.focus).toHaveBeenCalledWith("portfolio", false, false);
  expect(complete).toHaveBeenCalledExactlyOnceWith("portfolio");
  if (phase === "focus") expect(controller.transitionScreen).not.toHaveBeenCalledWith("home", false);
});

it("ignores an older overview reset after a channel is requested", async () => {
  let finish!: () => void;
  vi.mocked(controller.reset).mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
  const overview = vi.fn();
  const select = vi.fn();
  const complete = vi.fn();
  await act(async () => root.render(<ThreeCRTStage onSelect={select} onOverviewComplete={overview} />));
  await act(async () => root.render(<ThreeCRTStage onSelect={select} requestedChannel="portfolio" onOverviewComplete={overview} onRequestedFocusComplete={complete} />));
  await act(async () => finish());
  expect(overview).not.toHaveBeenCalled();
  expect(complete).toHaveBeenCalledExactlyOnceWith("portfolio");
});

it("allows local selections after a superseded channel-button request", async () => {
  let finish!: () => void;
  vi.mocked(controller.focus).mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
  const select = vi.fn();
  const complete = vi.fn();
  await act(async () => root.render(<ThreeCRTStage onSelect={select} onRequestedFocusComplete={complete} />));
  act(() => host.querySelectorAll("button")[0].click());
  await act(async () => root.render(<ThreeCRTStage onSelect={select} requestedChannel="portfolio" onRequestedFocusComplete={complete} />));
  await act(async () => finish());
  expect(select).not.toHaveBeenCalled();
  expect(complete).toHaveBeenCalledExactlyOnceWith("portfolio");
  await act(async () => host.querySelectorAll("button")[2].click());
  await act(async () => host.querySelectorAll("button")[0].click());
  expect(select.mock.calls).toEqual([["contact"], ["home"]]);
});

it("acknowledges a routed channel that was already focused by a local selection", async () => {
  const select = vi.fn();
  const complete = vi.fn();
  await act(async () => root.render(<ThreeCRTStage onSelect={select} onRequestedFocusComplete={complete} />));
  await act(async () => host.querySelectorAll("button")[0].click());
  expect(select).toHaveBeenCalledExactlyOnceWith("home");
  await act(async () => root.render(<ThreeCRTStage onSelect={select} requestedChannel="home" onRequestedFocusComplete={complete} />));
  expect(complete).toHaveBeenCalledExactlyOnceWith("home");
  expect(controller.focus).toHaveBeenCalledOnce();
});


it("keeps the loader and routed transition waiting for actual scene readiness", async () => {
  let finish!: () => void;
  controller.ready = new Promise<void>((resolve) => { finish = resolve; });
  await act(async () => root.render(<ThreeCRTStage onSelect={vi.fn()} requestedChannel="home" />));
  expect(host.querySelector('[role="progressbar"]')).not.toBeNull();
  expect(controller.focus).not.toHaveBeenCalled();
  await act(async () => {
    vi.mocked(createPortfolioScene).mock.calls[0][0]?.onLoadingProgress?.({ settled: 3, total: 7 });
  });
  expect(host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("3");
  await act(async () => finish());
  expect(host.querySelector('[role="progressbar"]')).toBeNull();
  expect(controller.focus).toHaveBeenCalledWith("home", false, false);
});

it("lets visitors continue through section navigation when loading stalls", async () => {
  controller.ready = new Promise<void>(() => {});
  const select = vi.fn();
  await act(async () => root.render(<ThreeCRTStage onSelect={select} />));
  expect(host.textContent).not.toContain("Continue without 3D");
  await act(async () => vi.advanceTimersByTime(10_000));
  const skip = [...host.querySelectorAll("button")].find(button => button.textContent === "Continue without 3D")!;
  await act(async () => skip.click());
  expect(host.querySelector('[role="progressbar"]')).toBeNull();
  expect(host.textContent).toContain("3D view unavailable");
  expect(controller.dispose).toHaveBeenCalledOnce();
  await act(async () => host.querySelector<HTMLButtonElement>("nav button")!.click());
  expect(select).toHaveBeenCalledWith("home");
});

it("falls back to section navigation if preparing the first frame fails", async () => {
  controller.ready = Promise.reject(new Error("Render failed"));
  await act(async () => root.render(<ThreeCRTStage onSelect={vi.fn()} />));
  expect(host.querySelector('[role="progressbar"]')).toBeNull();
  expect(host.querySelector(".is-unavailable")).not.toBeNull();
});
