import { useState, useCallback } from 'react'

/**
 * Hook for managing celebration state
 */
export function useCelebration() {
  const [isActive, setIsActive] = useState(false)

  const celebrate = useCallback(() => {
    setIsActive(true)
  }, [])

  const reset = useCallback(() => {
    setIsActive(false)
  }, [])

  return { isActive, celebrate, reset }
}
