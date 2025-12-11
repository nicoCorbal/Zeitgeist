import { useCallback } from 'react'

/**
 * Hook for haptic feedback using the Vibration API
 * Provides different vibration patterns for various interactions
 *
 * Patterns inspired by iOS haptic feedback:
 * - light: Quick tap for subtle feedback (buttons, toggles)
 * - medium: Slightly stronger for confirmations
 * - heavy: Strong feedback for important actions
 * - success: Celebration pattern (session complete, achievements)
 * - error: Alert pattern for errors
 * - selection: Very light for selection changes
 */
export function useHaptics() {
  // Check if vibration is supported
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  // Light tap - for button presses, toggles
  const light = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(10)
    }
  }, [isSupported])

  // Medium tap - for confirmations
  const medium = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(25)
    }
  }, [isSupported])

  // Heavy tap - for important actions
  const heavy = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(50)
    }
  }, [isSupported])

  // Success pattern - for completing sessions, achievements
  // Pattern: vibrate 30ms, pause 50ms, vibrate 30ms, pause 50ms, vibrate 50ms
  const success = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([30, 50, 30, 50, 50])
    }
  }, [isSupported])

  // Error pattern - for errors, warnings
  // Pattern: two quick buzzes
  const error = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([50, 100, 50])
    }
  }, [isSupported])

  // Selection change - very subtle
  const selection = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(5)
    }
  }, [isSupported])

  // Double tap - for special confirmations
  const double = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([20, 80, 20])
    }
  }, [isSupported])

  // Custom pattern
  const pattern = useCallback((vibrationPattern) => {
    if (isSupported && vibrationPattern) {
      navigator.vibrate(vibrationPattern)
    }
  }, [isSupported])

  // Stop any ongoing vibration
  const stop = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(0)
    }
  }, [isSupported])

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    error,
    selection,
    double,
    pattern,
    stop,
  }
}
