import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CRTIconButton from "../CRTIconButton";

describe("CRTIconButton", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: true,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
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

  it("composes caller interaction handlers with its fill behavior", () => {
    const handlers = {
      onPointerEnter: vi.fn(),
      onPointerLeave: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
    };

    act(() => root.render(
      <CRTIconButton label="Back" {...handlers}>
        <svg />
      </CRTIconButton>,
    ));

    const button = container.querySelector("button");
    if (!button) throw new Error("Missing icon button");

    act(() => {
      button.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
      button.dispatchEvent(new MouseEvent("pointerout", { bubbles: true }));
      button.focus();
      button.blur();
    });

    expect(handlers.onPointerEnter).toHaveBeenCalledOnce();
    expect(handlers.onPointerLeave).toHaveBeenCalledOnce();
    expect(handlers.onFocus).toHaveBeenCalledOnce();
    expect(handlers.onBlur).toHaveBeenCalledOnce();
  });
});
