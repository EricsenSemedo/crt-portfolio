import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function ParallaxBackground({ children, scale = 1, isAnimating = false, panState = { selectedId: null, scale: 1, isAnimating: false } }) {
    const [isParallaxEnabled, setIsParallaxEnabled] = useState(true);
    const parallaxTargetX = useMotionValue(0);
    const parallaxTargetY = useMotionValue(0);
    // Smooth spring for subtle drift. Increase damping for less bounce.
    const parallaxX = useSpring(parallaxTargetX, { stiffness: 160, damping: 30 });
    const parallaxY = useSpring(parallaxTargetY, { stiffness: 160, damping: 30 });

    useEffect(() => {
        if (panState.selectedId !== null || panState.scale > 1 || panState.isAnimating) {
            setIsParallaxEnabled(false);
        } else {
            setIsParallaxEnabled(true);
        }
    }, [panState.isAnimating, panState.scale, panState.selectedId]);

    useEffect(() => {
        if (!isParallaxEnabled) return;
        // Prevent parallax when user has reduced motion preference
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        function handlePointerMove(e) {
          if (reduce) return;
          // Center of screen in normalized coordinates
          const viewportCenterX = window.innerWidth / 2;
          const viewportCenterY = window.innerHeight / 2;
          const normalizedPointerX = (e.clientX - viewportCenterX) / viewportCenterX; // -1..1
          const normalizedPointerY = (e.clientY - viewportCenterY) / viewportCenterY;
          const clamp = (v) => Math.max(-1, Math.min(1, v));
      
          // Subtle amplitude; reduce while animating or when zoomed in
          const base = 10; // try 8–12
          const animFactor = isAnimating ? 0.4 : 1; // damp while animating
          const amp = (base / Math.max(1, scale)) * animFactor;
      
          parallaxTargetX.set(clamp(normalizedPointerX) * amp);
          parallaxTargetY.set(clamp(normalizedPointerY) * amp);
        }
        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
      }, [isAnimating, scale, isParallaxEnabled]);

    return (
        <motion.div className="absolute inset-0" style={{ x: parallaxX, y: parallaxY }}>
            {children}
        </motion.div>
    )
}