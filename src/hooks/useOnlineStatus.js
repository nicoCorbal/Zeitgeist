import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to track online/offline status
 * Returns current status and provides methods for handling connectivity
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Track that we came back online (for showing "back online" message)
      if (!isOnline) {
        setWasOffline(true)
        // Reset after 3 seconds
        setTimeout(() => setWasOffline(false), 3000)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isOnline])

  // Check if service worker is registered and active
  const [hasServiceWorker, setHasServiceWorker] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setHasServiceWorker(true)
      })
    }
  }, [])

  // Manually refresh data when coming back online
  const refresh = useCallback(() => {
    if (isOnline) {
      // Could trigger data sync here if needed
      window.location.reload()
    }
  }, [isOnline])

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    hasServiceWorker,
    refresh,
  }
}
