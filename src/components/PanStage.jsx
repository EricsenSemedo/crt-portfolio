import { motion, useAnimationControls } from "framer-motion";
import { Children, useEffect, useMemo, useRef, useState } from "react";

export default function PanStage({ children, focusScale = 6.5, className = "", onStateChange = () => {} }) {
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [selectedId, setSelectedId] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const resizeTimerRef = useRef(null);
  const controls = useAnimationControls();

  const nearlyEqual = (a, b, eps = 0.5) => Math.abs(a - b) <= eps;
  const isNoOp = (next) =>
    nearlyEqual(transform.x, next.x) &&
    nearlyEqual(transform.y, next.y) &&
    nearlyEqual(transform.scale, next.scale);

  async function animateTo(next) {
    if (isNoOp(next)) { setIsAnimating(false); return; }
    setIsAnimating(true);
    setTransform(next);
    try {
      await controls.start(next, { type: 'spring', duration: 0.5, bounce: 0.2 });
    } finally {
      setIsAnimating(false);
    }
  }

  const setItemRef = (id) => (el) => {
    if (!id) return;
    if (el) itemRefs.current.set(id, el); else itemRefs.current.delete(id);
  };

  function centerOn(id, nextScale = focusScale) {
    const el = itemRefs.current.get(id);
    const container = containerRef.current;
    if (!el || !container) return;

    // Prefer the inner screen element if present
    const targetEl = el.querySelector('[data-pan-target]') || el;
    const itemRect = targetEl.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    // Current transform
    const { x: tx0, y: ty0, scale: s0 } = transform;

    // Item center in screen coords
    const cxScreen = itemRect.left + itemRect.width / 2;
    const cyScreen = itemRect.top + itemRect.height / 2;

    // Compute local (pre-transform) coordinates of the item center relative to container
    const sSafe = s0 || 1;
    const localX = (cxScreen - contRect.left) / sSafe;
    const localY = (cyScreen - contRect.top) / sSafe;

    // Desired screen center
    const vx = window.innerWidth / 2;
    const vy = window.innerHeight / 2;

    // Original (pre-transform) top-left of container
    const origLeft = contRect.left - tx0;
    const origTop  = contRect.top  - ty0;

    // Solve for next translate with origin top-left and scale nextScale
    const tx1 = vx - origLeft - nextScale * localX;
    const ty1 = vy - origTop  - nextScale * localY;

    animateTo({ x: tx1, y: ty1, scale: nextScale });
  }

  function resetView() {
    setSelectedId(null);
    animateTo({ x: 0, y: 0, scale: 1 });
  }

  function recenterContainer(nextScale = transform.scale || 1) {
    const container = containerRef.current;
    if (!container) return;

    const contRect = container.getBoundingClientRect();
    const { x: tx0, y: ty0, scale: s0 } = transform;
    const sSafe = s0 || 1;

    const vx = window.innerWidth / 2;
    const vy = window.innerHeight / 2;

    const origLeft = contRect.left - tx0;
    const origTop  = contRect.top  - ty0;

    const localX = (contRect.width / sSafe) / 2;
    const localY = (contRect.height / sSafe) / 2;

    const tx1 = vx - origLeft - nextScale * localX;
    const ty1 = vy - origTop  - nextScale * localY;

    const next = { x: tx1, y: ty1, scale: nextScale };
    setTransform(next);
    controls.set(next);
  }

  useEffect(() => {
    function onResize() {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        if (selectedId) centerOn(selectedId, transform.scale || focusScale);
        else recenterContainer(transform.scale || 1);
      }, 100);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selectedId, transform.scale]);

  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, []);

  // Expose PanStage state to parent (e.g., App) for coordination
  useEffect(() => {
    onStateChange?.({ selectedId, scale: transform.scale || 1, isAnimating });
  }, [selectedId, transform.scale, isAnimating]);

  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  return (
    <div className={className}>
      <motion.div
        ref={containerRef}
        animate={controls}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        className="origin-top-left flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
      >
        {childrenArray.map((child) => {
          const id = child?.props?.panId;
          return (
            <div
              key={id ?? Math.random().toString(36)}
              ref={setItemRef(id)}
              onClick={(e) => { e.stopPropagation(); if (isAnimating) return; if (id) { setSelectedId(id); centerOn(id); } child?.props?.onClick?.(e); }}
            >
              {child}
            </div>
          );
        })}
      </motion.div>
      {selectedId && !isAnimating && (
        <div className="fixed inset-0" onClick={resetView} />
      )}
    </div>
  );
}
