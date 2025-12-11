import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to trap focus within a container (for modals/dialogs)
 * Returns a ref to attach to the container element
 *
 * Features:
 * - Traps focus within container when active
 * - Restores focus to trigger element on close
 * - Handles Escape key to close
 * - Auto-focuses first focusable element on open
 */
export function useFocusTrap(isActive, onClose) {
  const containerRef = useRef(null)
  const previousActiveElement = useRef(null)

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(containerRef.current.querySelectorAll(selector))
      .filter(el => {
        // Check if element is visible
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isActive) return

    // Close on Escape
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose?.()
      return
    }

    // Trap focus on Tab
    if (e.key === 'Tab') {
      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      // Shift+Tab from first element -> go to last
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
        return
      }

      // Tab from last element -> go to first
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
        return
      }
    }
  }, [isActive, onClose, getFocusableElements])

  // Setup and cleanup
  useEffect(() => {
    if (isActive) {
      // Store the currently focused element to restore later
      previousActiveElement.current = document.activeElement

      // Focus first focusable element after a short delay (for animations)
      const timer = setTimeout(() => {
        const focusable = getFocusableElements()
        // Try to focus close button first, then first focusable
        const closeButton = containerRef.current?.querySelector('[data-close-button]')
        if (closeButton) {
          closeButton.focus()
        } else if (focusable.length > 0) {
          focusable[0].focus()
        }
      }, 50)

      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        clearTimeout(timer)
        document.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      // Restore focus to previous element when closing
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        // Small delay to ensure the modal is fully closed
        setTimeout(() => {
          previousActiveElement.current?.focus()
        }, 50)
      }
    }
  }, [isActive, handleKeyDown, getFocusableElements])

  return containerRef
}

/**
 * Hook to detect reduced motion preference
 */
export function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const mediaQuery = typeof window !== 'undefined'
    ? window.matchMedia(query)
    : { matches: false }

  return mediaQuery.matches
}
