import { motion, useAnimationControls } from "framer-motion";
import { 
  Children, 
  forwardRef, 
  useEffect, 
  useImperativeHandle, 
  useMemo, 
  useRef, 
  useState,
  type ReactNode,
  type ReactElement,
  type MouseEvent
} from "react";
import type { PanState } from "../types";

interface CameraTransform {
  x: number;
  y: number;
  scale: number;
}

interface PanStageProps {
  children?: ReactNode;
  focusScale?: number;
  className?: string;
  onStateChange?: (state: PanState) => void;
}

export interface PanStageRef {
  reset: () => void;
  centerOn: (tvId: string, zoomLevel?: number) => void;
  selectTV: (tvId: string) => void;
}

interface ChildWithPanId {
  props: {
    'data-pan-id'?: string;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  };
}

/**
 * Camera control system for TV selection with smooth zoom animations.
 * Exposes imperative API for external navigation control.
 */
const PanStage = forwardRef<PanStageRef, PanStageProps>(function PanStage(
  { children, focusScale = 6.5, className = "", onStateChange = () => {} }, 
  ref
) {
  // ========================================
  // Refs & State Management
  // ========================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useAnimationControls();
  
  const [selectedTVId, setSelectedTVId] = useState<string | null>(null);
  const [cameraTransform, setCameraTransform] = useState<CameraTransform>({ x: 0, y: 0, scale: 1 });
  const [isAnimationInProgress, setIsAnimationInProgress] = useState(false);
  
  const currentTransformRef = useRef<CameraTransform>({ x: 0, y: 0, scale: 1 });
  const selectedTVIdRef = useRef<string | null>(null);

  // ========================================
  // Animation Utilities
  // ========================================
  
  const nearlyEqual = (a: number, b: number, eps = 0.5) => Math.abs(a - b) <= eps;
  
  const isTransformUnchanged = (nextTransform: CameraTransform) =>
    nearlyEqual(cameraTransform.x, nextTransform.x) &&
    nearlyEqual(cameraTransform.y, nextTransform.y) &&
    nearlyEqual(cameraTransform.scale, nextTransform.scale);

  async function animateCameraToPosition(nextTransform: CameraTransform) {
    if (isTransformUnchanged(nextTransform)) { 
      setIsAnimationInProgress(false); 
      return; 
    }
    
    setIsAnimationInProgress(true);
    setCameraTransform(nextTransform);
    currentTransformRef.current = nextTransform;
    
    const currentZoomLevel = cameraTransform.scale || 1;
    const targetZoomLevel = nextTransform.scale || 1;
    const isZoomingIn = targetZoomLevel > currentZoomLevel + 1e-6;
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    
    if (isMobile && isFirefox) {
      const containerElement = containerRef.current;
      if (containerElement) {
        const handleTransitionEnd = (event: TransitionEvent) => {
          if (event.propertyName === 'transform' && event.target === containerElement) {
            containerElement.style.transition = '';
            containerElement.removeEventListener('transitionend', handleTransitionEnd);
            setIsAnimationInProgress(false);
          }
        };
        
        containerElement.addEventListener('transitionend', handleTransitionEnd);
        containerElement.style.transition = 'transform 0.15s ease-out';
        containerElement.style.transform = `translate(${nextTransform.x}px, ${nextTransform.y}px) scale(${nextTransform.scale})`;
      }
      
      setCameraTransform(nextTransform);
      return;
    }

    const animationConfig = isZoomingIn
      ? { 
          type: 'tween' as const, 
          ease: 'easeInOut' as const, 
          duration: 0.2,
          velocity: 0,
          restDelta: 0.001
        }
      : { 
          type: 'spring' as const, 
          duration: 0.5, 
          bounce: 0.2
        };
    
    try {
      await controls.start(nextTransform, animationConfig);
    } finally {
      setIsAnimationInProgress(false);
    }
  }

  // ========================================
  // TV Reference Management
  // ========================================
  
  const setItemRef = (id: string | undefined) => (el: HTMLDivElement | null) => {
    if (!id) return;
    if (el) itemRefs.current.set(id, el); 
    else itemRefs.current.delete(id);
  };

  // ========================================
  // Camera Control Functions
  // ========================================
  
  function centerCameraOnTV(tvId: string, targetZoomLevel = focusScale) {
    const tvElement = itemRefs.current.get(tvId);
    const containerElement = containerRef.current;
    if (!tvElement || !containerElement) return;

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);

    if (isMobile && isFirefox) {
      requestAnimationFrame(() => {
        const screenElement = tvElement.querySelector('[data-pan-target]') || tvElement;
        const tvBoundingRect = screenElement.getBoundingClientRect();
        const containerBoundingRect = containerElement.getBoundingClientRect();

        const { x: currentX, y: currentY, scale: currentZoom } = cameraTransform;

        const tvCenterX = tvBoundingRect.left + tvBoundingRect.width / 2;
        const tvCenterY = tvBoundingRect.top + tvBoundingRect.height / 2;

        const safeCurrentZoom = currentZoom || 1;
        const localTVX = (tvCenterX - containerBoundingRect.left) / safeCurrentZoom;
        const localTVY = (tvCenterY - containerBoundingRect.top) / safeCurrentZoom;

        const originalContainerLeft = containerBoundingRect.left - currentX;
        const originalContainerTop = containerBoundingRect.top - currentY;

        const newCameraX = viewportCenterX - originalContainerLeft - targetZoomLevel * localTVX;
        const newCameraY = viewportCenterY - originalContainerTop - targetZoomLevel * localTVY;

        animateCameraToPosition({ x: newCameraX, y: newCameraY, scale: targetZoomLevel });
      });
      return;
    }

    requestAnimationFrame(() => {
      const screenElement = tvElement.querySelector('[data-pan-target]') || tvElement;
      const tvBoundingRect = screenElement.getBoundingClientRect();
      const containerBoundingRect = containerElement.getBoundingClientRect();

      const { x: currentX, y: currentY, scale: currentZoom } = cameraTransform;

      const tvCenterX = tvBoundingRect.left + tvBoundingRect.width / 2;
      const tvCenterY = tvBoundingRect.top + tvBoundingRect.height / 2;

      const safeCurrentZoom = currentZoom || 1;
      const localTVX = (tvCenterX - containerBoundingRect.left) / safeCurrentZoom;
      const localTVY = (tvCenterY - containerBoundingRect.top) / safeCurrentZoom;

      const originalContainerLeft = containerBoundingRect.left - currentX;
      const originalContainerTop = containerBoundingRect.top - currentY;

      const newCameraX = viewportCenterX - originalContainerLeft - targetZoomLevel * localTVX;
      const newCameraY = viewportCenterY - originalContainerTop - targetZoomLevel * localTVY;

      animateCameraToPosition({ x: newCameraX, y: newCameraY, scale: targetZoomLevel });
    });
  }

  function resetCameraToOverview() {
    setSelectedTVId(null);
    selectedTVIdRef.current = null;
    animateCameraToPosition({ x: 0, y: 0, scale: 1 });
  }

  function recenterContainerInViewport(targetZoomLevel = cameraTransform.scale || 1) {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    requestAnimationFrame(() => {
      const containerRect = containerElement.getBoundingClientRect();
      const { x: currentX, y: currentY, scale: currentZoom } = cameraTransform;
      const safeCurrentZoom = currentZoom || 1;

      const originalLeft = containerRect.left - currentX;
      const originalTop = containerRect.top - currentY;

      const containerCenterX = (containerRect.width / safeCurrentZoom) / 2;
      const containerCenterY = (containerRect.height / safeCurrentZoom) / 2;

      const newCameraX = viewportCenterX - originalLeft - targetZoomLevel * containerCenterX;
      const newCameraY = viewportCenterY - originalTop - targetZoomLevel * containerCenterY;

      const newTransform = { x: newCameraX, y: newCameraY, scale: targetZoomLevel };
      setCameraTransform(newTransform);
      currentTransformRef.current = newTransform;
      controls.set(newTransform);
    });
  }

  // ========================================
  // Effect Hooks & Event Handling
  // ========================================
  
  useEffect(() => {
    function handleWindowResize() {
      if (isAnimationInProgress || selectedTVIdRef.current) {
        return;
      }
      
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        if (selectedTVIdRef.current) {
          return;
        }
        
        recenterContainerInViewport(currentTransformRef.current.scale || 1);
      }, 150);
    }
    
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimationInProgress]);

  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    selectedTVIdRef.current = selectedTVId;
  }, [selectedTVId]);
  
  useEffect(() => {
    currentTransformRef.current = cameraTransform;
  }, [cameraTransform]);

  useEffect(() => {
    onStateChange?.({ 
      selectedId: selectedTVId, 
      scale: cameraTransform.scale || 1, 
      isAnimating: isAnimationInProgress 
    });
  }, [selectedTVId, cameraTransform.scale, isAnimationInProgress, onStateChange]);

  // ========================================
  // Imperative API
  // ========================================
  
  function selectTVById(tvId: string) {
    if (isAnimationInProgress || !tvId) return;
    setSelectedTVId(tvId);
    selectedTVIdRef.current = tvId;
    centerCameraOnTV(tvId);
  }

  useImperativeHandle(ref, () => ({
    reset: () => resetCameraToOverview(),
    centerOn: (tvId: string, zoomLevel = focusScale) => centerCameraOnTV(tvId, zoomLevel),
    selectTV: (tvId: string) => selectTVById(tvId),
  }), [focusScale, cameraTransform, isAnimationInProgress]);

  // ========================================
  // Render
  // ========================================
  
  const childrenArray = useMemo(() => Children.toArray(children) as ReactElement<ChildWithPanId['props']>[], [children]);

  return (
    <div className={className}>
      <motion.div
        ref={containerRef}
        animate={controls}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        className="origin-top-left flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
        style={{
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          WebkitTransform: 'translate3d(0, 0, 0)',
          WebkitBackfaceVisibility: 'hidden',
          WebkitPerspective: 1000,
          contain: 'layout style paint',
          isolation: 'isolate'
        }}
      >
        {childrenArray.map((child) => {
          const tvId = child?.props?.['data-pan-id'];
          return (
            <div
              key={tvId ?? Math.random().toString(36)}
              ref={setItemRef(tvId)}
              onClick={(e: MouseEvent<HTMLDivElement>) => { 
                e.stopPropagation(); 
                if (isAnimationInProgress) return; 
                if (tvId) { 
                  setSelectedTVId(tvId); 
                  selectedTVIdRef.current = tvId;
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
      
      {selectedTVId && !isAnimationInProgress && (
        <div className="fixed inset-0" onClick={resetCameraToOverview} />
      )}
    </div>
  );
});

export default PanStage;
