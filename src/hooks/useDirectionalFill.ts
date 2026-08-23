import { useState, type PointerEvent } from "react";

type FillOrigin = "top" | "right" | "bottom" | "left";

export default function useDirectionalFill<T extends HTMLElement>(mode: "vertical" | "all" = "vertical") {
  const [fillOrigin, setFillOrigin] = useState<FillOrigin>("bottom");
  const [fillVisible, setFillVisible] = useState(false);

  function pointerEdge(event: PointerEvent<T>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (mode === "vertical") return event.clientY < bounds.top + bounds.height / 2 ? "top" : "bottom";

    const distances: Array<[FillOrigin, number]> = [
      ["top", Math.abs(event.clientY - bounds.top)],
      ["right", Math.abs(bounds.right - event.clientX)],
      ["bottom", Math.abs(bounds.bottom - event.clientY)],
      ["left", Math.abs(event.clientX - bounds.left)],
    ];
    return distances.reduce((nearest, candidate) => candidate[1] < nearest[1] ? candidate : nearest)[0];
  }

  function handlePointerEnter(event: PointerEvent<T>) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
    setFillOrigin(pointerEdge(event));
    setFillVisible(true);
    return true;
  }

  function handlePointerLeave(event: PointerEvent<T>) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
    setFillOrigin(pointerEdge(event));
    setFillVisible(false);
    return true;
  }

  function handleFocus() {
    setFillOrigin("bottom");
    setFillVisible(true);
  }

  function handleBlur() {
    setFillVisible(false);
  }

  return { fillOrigin, fillVisible, handlePointerEnter, handlePointerLeave, handleFocus, handleBlur };
}
