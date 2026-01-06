import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * useFocusTrap Hook
 * 
 * Per Sprint 1 §2.3 and §4.5: Modal/Drawer Accessibility Contract
 * 
 * Traps focus within a container element (modal/drawer).
 * Tab/Shift+Tab cycles only through focusable elements inside the container.
 * 
 * Features:
 * - Automatic focus on first element when enabled
 * - Tab cycles forward
 * - Shift+Tab cycles backward
 * - Wraps around at boundaries
 * - Cleanup on disable
 * 
 * Usage:
 * ```tsx
 * const containerRef = useFocusTrap<HTMLDivElement>(isOpen);
 * 
 * return (
 *   <div ref={containerRef}>
 *     <input />
 *     <button>OK</button>
 *   </div>
 * );
 * ```
 */
export function useFocusTrap<T extends HTMLElement>(enabled: boolean = true) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];

      const elements = container.querySelectorAll<HTMLElement>(
        focusableSelectors.join(', ')
      );

      return Array.from(elements).filter((el) => {
        // Filter out hidden elements
        return el.offsetParent !== null;
      });
    };

    // Focus first element on mount
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure element is ready
      const timer = setTimeout(() => {
        focusableElements[0]?.focus();
      }, 100);

      // Cleanup timer
      return () => clearTimeout(timer);
    }

    // Handle Tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift+Tab (backward)
      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } 
      // Tab (forward)
      else {
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  return containerRef;
}

/**
 * useEscapeKey Hook
 * 
 * Per Sprint 1 §2.3: Modal/Drawer Accessibility Contract
 * 
 * Closes modal/drawer when Escape key is pressed.
 * 
 * Features:
 * - Only fires when enabled
 * - Prevents default behavior
 * - Cleanup on unmount
 * 
 * Usage:
 * ```tsx
 * useEscapeKey(() => setOpen(false), isOpen);
 * ```
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, enabled]);
}

/**
 * useFocusReturn Hook
 * 
 * Per Sprint 1 §2.3: Modal/Drawer Accessibility Contract
 * 
 * Returns focus to the trigger element when modal/drawer closes.
 * 
 * Features:
 * - Stores trigger element reference
 * - Returns focus on cleanup
 * - Handles cases where trigger is removed
 * 
 * Usage:
 * ```tsx
 * const triggerRef = useFocusReturn<HTMLButtonElement>(isOpen);
 * 
 * return (
 *   <>
 *     <button ref={triggerRef} onClick={() => setOpen(true)}>
 *       Open Modal
 *     </button>
 *     <Modal open={isOpen} />
 *   </>
 * );
 * ```
 */
export function useFocusReturn<T extends HTMLElement>(isOpen: boolean) {
  const triggerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element when opening
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      // Return focus when closing
      if (previousActiveElement.current && document.body.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus();
      }
      previousActiveElement.current = null;
    }
  }, [isOpen]);

  return triggerRef;
}

/**
 * useAntiDoubleSubmit Hook
 * 
 * Per Sprint 1 §4.5: Modal/Drawer Form Kit
 * 
 * Prevents double submission by:
 * - Locking form state after submit until result returns
 * - Using a request_id (UUID) for idempotency
 * - Disabling submit button during submission
 * 
 * Features:
 * - Automatic loading state
 * - UUID generation for each request
 * - Error handling
 * - Automatic cleanup
 * 
 * Usage:
 * ```tsx
 * const { isSubmitting, requestId, handleSubmit } = useAntiDoubleSubmit(async (requestId) => {
 *   await api.submitLead({ ...data, request_id: requestId });
 * });
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <button disabled={isSubmitting}>
 *       {isSubmitting ? 'Submitting...' : 'Submit'}
 *     </button>
 *   </form>
 * );
 * ```
 */
export function useAntiDoubleSubmit<TData = any>(
  submitFn: (requestId: string, data?: TData) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestIdRef = useRef<string>('');
  const submittingRef = useRef<boolean>(false);

  // Generate UUID v4
  const generateUUID = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  const handleSubmit = useCallback(
    async (data?: TData) => {
      // Prevent double submission
      if (submittingRef.current) {
        console.warn('[useAntiDoubleSubmit] Submission already in progress');
        return;
      }

      // Generate new request ID
      const requestId = generateUUID();
      requestIdRef.current = requestId;

      // Lock submission
      submittingRef.current = true;
      setIsSubmitting(true);

      try {
        await submitFn(requestId, data);
      } catch (error) {
        console.error('[useAntiDoubleSubmit] Submission failed:', error);
        throw error;
      } finally {
        // Unlock submission
        submittingRef.current = false;
        setIsSubmitting(false);
        requestIdRef.current = '';
      }
    },
    [submitFn, generateUUID]
  );

  return {
    isSubmitting,
    requestId: requestIdRef.current,
    handleSubmit,
  };
}
