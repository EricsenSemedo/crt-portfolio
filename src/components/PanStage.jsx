import { motion } from "framer-motion";
import { Children, useEffect, useMemo, useRef, useState } from "react";

export default function PanStage({ children, focusScale = 6, className = "" }) {
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [selectedId, setSelectedId] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

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

    setTransform({ x: tx1, y: ty1, scale: nextScale });
  }

  function resetView() {
    setSelectedId(null);
    setTransform({ x: 0, y: 0, scale: 1 });
  }

  useEffect(() => {
    function onResize() { if (selectedId) centerOn(selectedId); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selectedId]);

  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  return (
    <div className={className}>
      <motion.div
        ref={containerRef}
        animate={transform}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        className="origin-top-left flex items-center justify-center gap-8 py-8 bg-red-500"
      >
        {childrenArray.map((child) => {
          const id = child?.props?.panId;
          return (
            <div
              key={id ?? Math.random().toString(36)}
              ref={setItemRef(id)}
              onClick={(e) => { e.stopPropagation(); if (id) { setSelectedId(id); centerOn(id); } child?.props?.onClick?.(e); }}
            >
              {child}
            </div>
          );
        })}
      </motion.div>
      {selectedId && (
        <div className="fixed inset-0" onClick={resetView} />
      )}
    </div>
  );
}
