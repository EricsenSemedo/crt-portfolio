import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PanState } from "../types";

interface ParallaxBackgroundProps {
  children?: ReactNode;
  scale?: number;
  isAnimating?: boolean;
  panState?: PanState;
}

/**
 * Subtle mouse-following background effect with spring animations.
 * Automatically disables during TV interactions and respects reduced motion preferences.
 */
export default function ParallaxBackground({ 
  children, 
  scale = 1, 
  isAnimating = false, 
  panState = { selectedId: null, scale: 1, isAnimating: false } 
}: ParallaxBackgroundProps) {
  // ========================================
  // State & Motion Values
  // ========================================
  
  // Controls whether parallax effect is active
  const [isParallaxEnabled, setIsParallaxEnabled] = useState(true);
  
  // Target values for parallax offset (controlled by mouse position)
  const parallaxTargetX = useMotionValue(0);
  const parallaxTargetY = useMotionValue(0);
  
  // Smooth spring-animated values for actual parallax offset
  const parallaxX = useSpring(parallaxTargetX, { stiffness: 160, damping: 30 });
  const parallaxY = useSpring(parallaxTargetY, { stiffness: 160, damping: 30 });
  
  // Track whether pointer is inside viewport
  const isPointerInsideRef = useRef(false);
  
  // ========================================
  // Utility Functions
  // ========================================
  
  // Clamp value to [-1, 1] range
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  // ========================================
  // Effect: Enable/Disable Parallax Based on TV State
  // ========================================
  
  useEffect(() => {
    if (panState.selectedId !== null || panState.scale > 1 || panState.isAnimating) {
      setIsParallaxEnabled(false);
    } else {
      setIsParallaxEnabled(true);
    }
  }, [panState.isAnimating, panState.scale, panState.selectedId]);

  // ========================================
  // Effect: Main Parallax Mouse Tracking
  // ========================================
  
  useEffect(() => {
    if (!isParallaxEnabled) return;
    
    // Disable parallax on mobile devices for better performance
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isMobile || isTouchDevice) {
      return;
    }
    
    // Respect user's motion preferences
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    function isInsideViewport(e: PointerEvent) {
      return e.clientX >= 0 && e.clientX <= window.innerWidth && 
             e.clientY >= 0 && e.clientY <= window.innerHeight;
    }

    function resetOffsets() {
      isPointerInsideRef.current = false;
      parallaxTargetX.set(0);
      parallaxTargetY.set(0);
    }

    function handlePointerMove(e: PointerEvent) {
      if (reduce) return;
      if (!isInsideViewport(e)) { 
        isPointerInsideRef.current = false; 
        return; 
      }
      isPointerInsideRef.current = true;

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      
      const normalizedPointerX = (e.clientX - viewportCenterX) / viewportCenterX;
      const normalizedPointerY = (e.clientY - viewportCenterY) / viewportCenterY;

      const base = 10;
      const animFactor = isAnimating ? 0.4 : 1;
      const amp = (base / Math.max(1, scale)) * animFactor;

      parallaxTargetX.set(clamp(normalizedPointerX) * amp);
      parallaxTargetY.set(clamp(normalizedPointerY) * amp);
    }

    function handleResize() { 
      if (panState.selectedId || panState.isAnimating) {
        return;
      }
      resetOffsets(); 
    }
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
  }, [isAnimating, scale, isParallaxEnabled, panState.selectedId, panState.isAnimating, parallaxTargetX, parallaxTargetY]);

  // ========================================
  // Render
  // ========================================
  
  return (
    <motion.div 
      className="absolute inset-0 overflow-hidden" 
      style={{ x: parallaxX, y: parallaxY }}
    >
      {children}
    </motion.div>
  );
}
