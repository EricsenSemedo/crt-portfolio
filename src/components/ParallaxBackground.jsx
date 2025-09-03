import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function ParallaxBackground({ children, scale = 1, isAnimating = false, panState = { selectedId: null, scale: 1, isAnimating: false } }) {
    const [isParallaxEnabled, setIsParallaxEnabled] = useState(true);
    const parallaxTargetX = useMotionValue(0);
    const parallaxTargetY = useMotionValue(0);
    // Smooth spring for subtle drift. Increase damping for less bounce.
    const parallaxX = useSpring(parallaxTargetX, { stiffness: 160, damping: 30 });
    const parallaxY = useSpring(parallaxTargetY, { stiffness: 160, damping: 30 });
    const isPointerInsideRef = useRef(false);
    const clamp = (v) => Math.max(-1, Math.min(1, v));

    useEffect(() => {
        if (panState.selectedId !== null || panState.scale > 1 || panState.isAnimating) {
            setIsParallaxEnabled(false);
        } else {
            setIsParallaxEnabled(true);
        }
    }, [panState.isAnimating, panState.scale, panState.selectedId]);

    useEffect(() => {
        if (!isParallaxEnabled) return;
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        function isInsideViewport(e) {
            return e.clientX >= 0 && e.clientX <= window.innerWidth && e.clientY >= 0 && e.clientY <= window.innerHeight;
        }

        function resetOffsets() {
            isPointerInsideRef.current = false;
            parallaxTargetX.set(0);
            parallaxTargetY.set(0);
        }

        function handlePointerMove(e) {
            if (reduce) return;
            if (!isInsideViewport(e)) { isPointerInsideRef.current = false; return; }
            isPointerInsideRef.current = true;

            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            const normalizedPointerX = (e.clientX - viewportCenterX) / viewportCenterX; // -1..1
            const normalizedPointerY = (e.clientY - viewportCenterY) / viewportCenterY;

            const base = 10; // try 8–12
            const animFactor = isAnimating ? 0.4 : 1;
            const amp = (base / Math.max(1, scale)) * animFactor;

            parallaxTargetX.set(clamp(normalizedPointerX) * amp);
            parallaxTargetY.set(clamp(normalizedPointerY) * amp);
        }

        function handleResize() { resetOffsets(); }
        function handleBlur() { resetOffsets(); }
        function handleVisibility() { if (document.hidden) resetOffsets(); }
        function handleMouseLeave() { resetOffsets(); }

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('resize', handleResize);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
      }, [isAnimating, scale, isParallaxEnabled]);

    return (
        <motion.div className="absolute inset-0" style={{ x: parallaxX, y: parallaxY }}>
            {children}
        </motion.div>
    )
}