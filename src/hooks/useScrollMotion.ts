import Lenis from "lenis";
import { useEffect, type RefObject } from "react";
import { getScrollRevealState, hasScrollableOverflow, shouldUseDesktopSmoothScroll } from "../utils/scrollMotion";

const SCROLL_SURFACE_SELECTOR = ".crt-page, [data-crt-scroll-container]";

function getEnvironment() {
  return {
    hasFinePointer: window.matchMedia("(pointer: fine)").matches,
    canHover: window.matchMedia("(hover: hover)").matches,
    maxTouchPoints: navigator.maxTouchPoints,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    viewportWidth: window.innerWidth,
  };
}

function getSurfaceRows(surface: HTMLElement) {
  return [...surface.querySelectorAll<HTMLElement>(".crt-scroll-reveal")]
    .filter((row) => row.closest(SCROLL_SURFACE_SELECTOR) === surface);
}

function updateSurfaceRows(surface: HTMLElement, reducedMotion: boolean) {
  const surfaceRect = surface.getBoundingClientRect();
  const viewportHeight = surface.clientHeight;
  const revealDisabled = reducedMotion || !hasScrollableOverflow(surface.scrollHeight, viewportHeight);

  for (const row of getSurfaceRows(surface)) {
    const rowTop = row.getBoundingClientRect().top - surfaceRect.top;
    const state = getScrollRevealState(rowTop, viewportHeight, revealDisabled);
    row.style.setProperty("--crt-reveal-opacity", state.opacity.toFixed(3));
    row.style.setProperty("--crt-reveal-blur", `${state.blur.toFixed(2)}px`);
    row.classList.toggle("is-crt-revealing", state.opacity > 0 && state.opacity < 1);
  }
}

export default function useScrollMotion(
  rootRef: RefObject<HTMLElement | null>,
  lifecycleKey: string | undefined,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !lifecycleKey) return;

    const lenisBySurface = new Map<HTMLElement, Lenis>();
    const nativeSurfaces = new Set<HTMLElement>();
    const observedLayoutBySurface = new Map<HTMLElement, Element[]>();
    let animationFrame: number | undefined;
    let rowUpdateFrame: number | undefined;
    let surfaceSyncFrame: number | undefined;
    let isDesktopSmooth = false;
    let reducedMotion = false;

    function updateAllRows() {
      root.querySelectorAll<HTMLElement>(SCROLL_SURFACE_SELECTOR)
        .forEach((surface) => updateSurfaceRows(surface, reducedMotion));
    }

    function requestRowUpdate() {
      if (rowUpdateFrame !== undefined) return;
      rowUpdateFrame = window.requestAnimationFrame(() => {
        rowUpdateFrame = undefined;
        updateAllRows();
      });
    }

    function addNativeSurface(surface: HTMLElement) {
      if (nativeSurfaces.has(surface)) return;
      surface.addEventListener("scroll", requestRowUpdate, { passive: true });
      nativeSurfaces.add(surface);
    }

    function removeNativeSurface(surface: HTMLElement) {
      surface.removeEventListener("scroll", requestRowUpdate);
      nativeSurfaces.delete(surface);
    }

    function createLenis(surface: HTMLElement) {
      const content = surface.firstElementChild;
      if (!(content instanceof HTMLElement)) return;

      const isRootSurface = surface.classList.contains("crt-page");
      const lenis = new Lenis({
        wrapper: surface,
        content,
        eventsTarget: surface,
        autoRaf: false,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.09,
        overscroll: false,
        // NOTE: Nested project channels own their wheel input, so the outer TV page must not consume the same gesture.
        prevent: isRootSurface
          ? (node) => Boolean(node.closest("[data-crt-scroll-container]"))
          : undefined,
      });
      lenis.on("scroll", requestRowUpdate);
      lenisBySurface.set(surface, lenis);
    }

    const resizeObserver = new ResizeObserver(requestRowUpdate);

    function observeSurfaceLayout(surface: HTMLElement) {
      if (observedLayoutBySurface.has(surface)) return;
      const elements: Element[] = [surface];
      if (surface.firstElementChild) elements.push(surface.firstElementChild);
      elements.forEach((element) => resizeObserver.observe(element));
      observedLayoutBySurface.set(surface, elements);
    }

    function stopObservingSurfaceLayout(surface: HTMLElement) {
      observedLayoutBySurface.get(surface)?.forEach((element) => resizeObserver.unobserve(element));
      observedLayoutBySurface.delete(surface);
    }

    function syncSurfaces() {
      const surfaces = new Set(root.querySelectorAll<HTMLElement>(SCROLL_SURFACE_SELECTOR));

      for (const [surface, lenis] of lenisBySurface) {
        if (surfaces.has(surface) && isDesktopSmooth) continue;
        lenis.destroy();
        lenisBySurface.delete(surface);
      }

      for (const surface of [...nativeSurfaces]) {
        if (surfaces.has(surface) && !isDesktopSmooth) continue;
        removeNativeSurface(surface);
      }

      for (const surface of observedLayoutBySurface.keys()) {
        if (!surfaces.has(surface)) stopObservingSurfaceLayout(surface);
      }

      for (const surface of surfaces) {
        observeSurfaceLayout(surface);
        if (isDesktopSmooth) {
          if (!lenisBySurface.has(surface)) createLenis(surface);
        } else {
          addNativeSurface(surface);
        }
      }

      updateAllRows();
    }

    function configureInputMode() {
      const environment = getEnvironment();
      reducedMotion = environment.reducedMotion;
      isDesktopSmooth = shouldUseDesktopSmoothScroll(environment);
      syncSurfaces();
      if (isDesktopSmooth && animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(tick);
      } else if (!isDesktopSmooth && animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    }

    function tick(time: number) {
      for (const lenis of lenisBySurface.values()) lenis.raf(time);
      animationFrame = isDesktopSmooth ? window.requestAnimationFrame(tick) : undefined;
    }

    const mutationObserver = new MutationObserver(() => {
      if (surfaceSyncFrame !== undefined) return;
      surfaceSyncFrame = window.requestAnimationFrame(() => {
        surfaceSyncFrame = undefined;
        syncSurfaces();
      });
    });

    const inputMediaQueries = [
      window.matchMedia("(pointer: fine)"),
      window.matchMedia("(hover: hover)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];

    configureInputMode();
    mutationObserver.observe(root, { childList: true, subtree: true });
    window.addEventListener("resize", configureInputMode, { passive: true });
    inputMediaQueries.forEach((query) => query.addEventListener("change", configureInputMode));

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", configureInputMode);
      inputMediaQueries.forEach((query) => query.removeEventListener("change", configureInputMode));
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      if (rowUpdateFrame !== undefined) window.cancelAnimationFrame(rowUpdateFrame);
      if (surfaceSyncFrame !== undefined) window.cancelAnimationFrame(surfaceSyncFrame);
      for (const lenis of lenisBySurface.values()) lenis.destroy();
      for (const surface of nativeSurfaces) surface.removeEventListener("scroll", requestRowUpdate);
    };
  }, [lifecycleKey, rootRef]);
}
