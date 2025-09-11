import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Subtle mouse-following background effect with spring animations.
 * Automatically disables during TV interactions and respects reduced motion preferences.
 */
export default function ParallaxBackground({ 
  children, 
  scale = 1, 
  isAnimating = false, 
  panState = { selectedId: null, scale: 1, isAnimating: false } 
}) {
  // ========================================
  // State & Motion Values
  // ========================================
  
  // Controls whether parallax effect is active
  const [isParallaxEnabled, setIsParallaxEnabled] = useState(true);
  
  // Target values for parallax offset (controlled by mouse position)
  const parallaxTargetX = useMotionValue(0);
  const parallaxTargetY = useMotionValue(0);
  
  // Smooth spring-animated values for actual parallax offset
  // Higher damping = less bounce, more subtle movement
  const parallaxX = useSpring(parallaxTargetX, { stiffness: 160, damping: 30 });
  const parallaxY = useSpring(parallaxTargetY, { stiffness: 160, damping: 30 });
  
  // Track whether pointer is inside viewport
  const isPointerInsideRef = useRef(false);
  
  // ========================================
  // Utility Functions
  // ========================================
  
  // Clamp value to [-1, 1] range
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  // ========================================
  // Effect: Enable/Disable Parallax Based on TV State
  // ========================================
  
  /**
   * Disable parallax when viewing a TV or during animations
   * This improves performance and prevents conflicting motion
   */
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
  
  /**
   * Core parallax effect implementation
   * Tracks mouse movement and translates it to subtle background offset
   */
  useEffect(() => {
    if (!isParallaxEnabled) return;
    
    // Disable parallax on mobile devices for better performance
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isMobile || isTouchDevice) {
      console.log('📱 Parallax disabled on mobile device');
      return;
    }
    
    // Respect user's motion preferences
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    /**
     * Check if pointer is within viewport bounds
     * Prevents parallax glitches when resizing from window edges
     */
    function isInsideViewport(e) {
      return e.clientX >= 0 && e.clientX <= window.innerWidth && 
             e.clientY >= 0 && e.clientY <= window.innerHeight;
    }

    /**
     * Reset parallax to center position
     * Used when focus leaves window or during resize events
     */
    function resetOffsets() {
      isPointerInsideRef.current = false;
      parallaxTargetX.set(0);
      parallaxTargetY.set(0);
    }

    /**
     * Main pointer movement handler
     * Converts mouse position to normalized parallax offset
     */
    function handlePointerMove(e) {
      if (reduce) return; // Respect reduced motion preference
      if (!isInsideViewport(e)) { 
        isPointerInsideRef.current = false; 
        return; 
      }
      isPointerInsideRef.current = true;

      // Calculate viewport center
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      
      // Normalize pointer position to [-1, 1] range
      const normalizedPointerX = (e.clientX - viewportCenterX) / viewportCenterX;
      const normalizedPointerY = (e.clientY - viewportCenterY) / viewportCenterY;

      // Calculate parallax amplitude with scale and animation factors
      const base = 10; // Base parallax strength (adjustable: 8-12 range)
      const animFactor = isAnimating ? 0.4 : 1; // Reduce during animations
      const amp = (base / Math.max(1, scale)) * animFactor;

      // Apply clamped offset to motion values
      parallaxTargetX.set(clamp(normalizedPointerX) * amp);
      parallaxTargetY.set(clamp(normalizedPointerY) * amp);
    }

    // Event handlers for resetting parallax state
    function handleResize() { 
      // Don't reset parallax when any TV is selected or during animations
      if (panState.selectedId || panState.isAnimating) {
        return;
      }
      resetOffsets(); 
    }
    function handleBlur() { resetOffsets(); }
    function handleVisibility() { if (document.hidden) resetOffsets(); }
    function handleMouseLeave() { resetOffsets(); }

    // Add event listeners
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup on unmount or dependency change
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isAnimating, scale, isParallaxEnabled]);

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