import { motion, useAnimationControls } from "framer-motion";
import { Children, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

/**
 * Camera control system for TV selection with smooth zoom animations.
 * Exposes imperative API for external navigation control.
 */
export default forwardRef(function PanStage({ children, focusScale = 6.5, className = "", onStateChange = () => {} }, ref) {
  // ========================================
  // Refs & State Management
  // ========================================
  
  // DOM references
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const resizeTimerRef = useRef(null);
  const controls = useAnimationControls();
  
  // Core state
  const [selectedTVId, setSelectedTVId] = useState(null);
  const [cameraTransform, setCameraTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isAnimationInProgress, setIsAnimationInProgress] = useState(false);

  // ========================================
  // Animation Utilities
  // ========================================
  
  const nearlyEqual = (a, b, eps = 0.5) => Math.abs(a - b) <= eps;
  
  const isTransformUnchanged = (nextTransform) =>
    nearlyEqual(cameraTransform.x, nextTransform.x) &&
    nearlyEqual(cameraTransform.y, nextTransform.y) &&
    nearlyEqual(cameraTransform.scale, nextTransform.scale);

  // Uses different animation types: fast tween for zoom-in, bouncy spring for zoom-out
  async function animateCameraToPosition(nextTransform) {
    if (isTransformUnchanged(nextTransform)) { 
      setIsAnimationInProgress(false); 
      return; 
    }
    
    setIsAnimationInProgress(true);
    setCameraTransform(nextTransform);
    
    // Choose animation type based on zoom direction
    const currentZoomLevel = cameraTransform.scale || 1;
    const targetZoomLevel = nextTransform.scale || 1;
    const isZoomingIn = targetZoomLevel > currentZoomLevel + 1e-6;
    
    const animationConfig = isZoomingIn
      ? { type: 'tween', ease: 'easeInOut', duration: 0.2 }  // Fast zoom in
      : { type: 'spring', duration: 0.5, bounce: 0.2 };      // Smooth zoom out
    
    try {
      await controls.start(nextTransform, animationConfig);
    } finally {
      setIsAnimationInProgress(false);
    }
  }

  // ========================================
  // TV Reference Management
  // ========================================
  
  const setItemRef = (id) => (el) => {
    if (!id) return;
    if (el) itemRefs.current.set(id, el); 
    else itemRefs.current.delete(id);
  };

  // ========================================
  // Camera Control Functions
  // ========================================
  
  // Complex coordinate transformation to position TV at screen center
  function centerCameraOnTV(tvId, targetZoomLevel = focusScale) {
    const tvElement = itemRefs.current.get(tvId);
    const containerElement = containerRef.current;
    if (!tvElement || !containerElement) return;

    // Target the inner screen element for precise centering
    const screenElement = tvElement.querySelector('[data-pan-target]') || tvElement;
    const tvBoundingRect = screenElement.getBoundingClientRect();
    const containerBoundingRect = containerElement.getBoundingClientRect();

    // Current camera transform state
    const { x: currentX, y: currentY, scale: currentZoom } = cameraTransform;

    // Calculate TV center in screen coordinates
    const tvCenterX = tvBoundingRect.left + tvBoundingRect.width / 2;
    const tvCenterY = tvBoundingRect.top + tvBoundingRect.height / 2;

    // Convert to local coordinates (before transform) relative to container
    const safeCurrentZoom = currentZoom || 1;
    const localTVX = (tvCenterX - containerBoundingRect.left) / safeCurrentZoom;
    const localTVY = (tvCenterY - containerBoundingRect.top) / safeCurrentZoom;

    // Target position: center of viewport
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    // Calculate original container position (before any transforms)
    const originalContainerLeft = containerBoundingRect.left - currentX;
    const originalContainerTop = containerBoundingRect.top - currentY;

    // Solve for new translation to center the TV at viewport center with new scale
    const newCameraX = viewportCenterX - originalContainerLeft - targetZoomLevel * localTVX;
    const newCameraY = viewportCenterY - originalContainerTop - targetZoomLevel * localTVY;

    animateCameraToPosition({ x: newCameraX, y: newCameraY, scale: targetZoomLevel });
  }

  function resetCameraToOverview() {
    setSelectedTVId(null);
    animateCameraToPosition({ x: 0, y: 0, scale: 1 });
  }

  // Maintains zoom level but adjusts position for window resize
  function recenterContainerInViewport(targetZoomLevel = cameraTransform.scale || 1) {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const containerRect = containerElement.getBoundingClientRect();
    const { x: currentX, y: currentY, scale: currentZoom } = cameraTransform;
    const safeCurrentZoom = currentZoom || 1;

    // Viewport center coordinates
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    // Original container position (before transforms)
    const originalLeft = containerRect.left - currentX;
    const originalTop = containerRect.top - currentY;

    // Container center in local coordinates
    const containerCenterX = (containerRect.width / safeCurrentZoom) / 2;
    const containerCenterY = (containerRect.height / safeCurrentZoom) / 2;

    // Calculate new translation to center container
    const newCameraX = viewportCenterX - originalLeft - targetZoomLevel * containerCenterX;
    const newCameraY = viewportCenterY - originalTop - targetZoomLevel * containerCenterY;

    const newTransform = { x: newCameraX, y: newCameraY, scale: targetZoomLevel };
    setCameraTransform(newTransform);
    controls.set(newTransform); // Immediate update without animation
  }

  // ========================================
  // Effect Hooks & Event Handling
  // ========================================
  
  useEffect(() => {
    function handleWindowResize() {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        if (selectedTVId) {
          // Re-center on selected TV
          centerCameraOnTV(selectedTVId, cameraTransform.scale || focusScale);
        } else {
          // Recenter overview
          recenterContainerInViewport(cameraTransform.scale || 1);
        }
      }, 100);
    }
    
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [selectedTVId, cameraTransform.scale]);

  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    onStateChange?.({ 
      selectedId: selectedTVId, 
      scale: cameraTransform.scale || 1, 
      isAnimating: isAnimationInProgress 
    });
  }, [selectedTVId, cameraTransform.scale, isAnimationInProgress]);

  // ========================================
  // Imperative API
  // ========================================
  
  function selectTVById(tvId) {
    if (isAnimationInProgress || !tvId) return;
    setSelectedTVId(tvId);
    centerCameraOnTV(tvId);
  }

  useImperativeHandle(ref, () => ({
    reset: () => resetCameraToOverview(),
    centerOn: (tvId, zoomLevel = focusScale) => centerCameraOnTV(tvId, zoomLevel),
    selectTV: (tvId) => selectTVById(tvId),
  }), [focusScale, resetCameraToOverview, centerCameraOnTV, selectTVById, isAnimationInProgress]);

  // ========================================
  // Render
  // ========================================
  
  // Memoize children array to prevent unnecessary re-renders
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  return (
    <div className={className}>
      {/* Main animated container that holds all TVs */}
      <motion.div
        ref={containerRef}
        animate={controls}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        className="origin-top-left flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
      >
        {childrenArray.map((child) => {
          const tvId = child?.props?.panId;
          return (
            <div
              key={tvId ?? Math.random().toString(36)}
              ref={setItemRef(tvId)}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (isAnimationInProgress) return; 
                if (tvId) { 
                  setSelectedTVId(tvId); 
                  centerCameraOnTV(tvId); 
                } 
                child?.props?.onClick?.(e); 
              }}
            >
              {child}
            </div>
          );
        })}
      </motion.div>
      
      {/* Invisible overlay to capture clicks for reset when TV is selected */}
      {selectedTVId && !isAnimationInProgress && (
        <div className="fixed inset-0" onClick={resetCameraToOverview} />
      )}
    </div>
  );
})
