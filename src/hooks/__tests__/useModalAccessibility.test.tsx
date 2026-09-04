import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useModalAccessibility } from "../useModalAccessibility";

it("contains keyboard focus, includes media controls, and restores the opener", () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  const host = document.createElement("div");
  const opener = document.createElement("button");
  document.body.append(opener, host);
  opener.focus();
  const root = createRoot(host);
  const close = vi.fn();
  let unmounted = false;
  function Dialog() {
    const dialogRef = useRef<HTMLDivElement>(null);
    useModalAccessibility({ isOpen: true, dialogRef, initialFocus: "dialog", onClose: close });
    return <div ref={dialogRef} tabIndex={-1}>
      <div aria-hidden="true"><button>Hidden</button></div>
      <div style={{ display: "none" }}><button>Hidden by parent</button></div>
      <button>First</button>
      <video controls tabIndex={0} />
      <video controls tabIndex={-1} />
    </div>;
  }
  try {
    act(() => root.render(<Dialog />));
    act(() => vi.advanceTimersByTime(20));
    const dialog = host.firstElementChild!;
    const first = [...host.querySelectorAll("button")].find((button) => button.textContent === "First")!;
    const last = host.querySelector("video")!;
    expect(document.activeElement).toBe(dialog);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, cancelable: true }));
    expect(document.activeElement).toBe(last);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", cancelable: true }));
    expect(document.activeElement).toBe(first);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }));
    expect(close).toHaveBeenCalledOnce();
    act(() => root.unmount());
    unmounted = true;
    expect(document.activeElement).toBe(opener);
  } finally {
    if (!unmounted) act(() => root.unmount());
    host.remove();
    opener.remove();
    vi.useRealTimers();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
  }
});
