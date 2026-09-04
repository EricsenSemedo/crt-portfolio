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
