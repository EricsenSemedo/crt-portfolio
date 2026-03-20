import { useEffect, useRef, type RefObject } from "react";

interface UseModalAccessibilityOptions {
  isOpen: boolean;
  dialogRef: RefObject<HTMLElement | null>;
  backgroundRef?: RefObject<HTMLElement | null>;
  onClose?: () => void;
}

const activeModalStack: HTMLElement[] = [];

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(","))).filter((element) => {
    return !element.hasAttribute("disabled") &&
      !element.inert &&
      element.closest("[inert]") === null &&
      element.getAttribute("aria-hidden") !== "true";
  });
}

function isTopmostModal(dialog: HTMLElement): boolean {
  return activeModalStack[activeModalStack.length - 1] === dialog;
}

/**
 * Adds modal keyboard behavior and temporarily removes background content from interaction.
 */
export function useModalAccessibility({
  isOpen,
  dialogRef,
  backgroundRef,
  onClose,
}: UseModalAccessibilityOptions) {
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const existingDialogIndex = activeModalStack.lastIndexOf(dialog);
    if (existingDialogIndex !== -1) {
      activeModalStack.splice(existingDialogIndex, 1);
    }
    activeModalStack.push(dialog);
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const background = backgroundRef?.current;
    const previousAriaHidden = background?.getAttribute("aria-hidden");
    const previousInert = background?.inert ?? false;

    if (background) {
      background.inert = true;
      background.setAttribute("aria-hidden", "true");
    }

    const frame = window.requestAnimationFrame(() => {
      if (!isTopmostModal(dialog)) return;
      const [firstFocusable] = getFocusableElements(dialog);
      (firstFocusable ?? dialog).focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (!isTopmostModal(dialog)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(dialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const isOutsideDialog = !activeElement || !dialog.contains(activeElement);

      if (event.shiftKey) {
        if (isOutsideDialog || activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
        return;
      }

      if (isOutsideDialog || activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown, true);
      const dialogIndex = activeModalStack.lastIndexOf(dialog);
      if (dialogIndex !== -1) {
        activeModalStack.splice(dialogIndex, 1);
      }

      if (background) {
        background.inert = previousInert;

        if (previousAriaHidden === null) {
          background.removeAttribute("aria-hidden");
        } else {
          background.setAttribute("aria-hidden", previousAriaHidden);
        }
      }

      const elementToRestore = restoreFocusRef.current;
      if (elementToRestore && elementToRestore.isConnected) {
        elementToRestore.focus();
      }
    };
  }, [backgroundRef, dialogRef, isOpen, onClose]);
}
