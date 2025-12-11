import { useState, useEffect, useCallback, useRef } from 'react'

// Check if localStorage is available and working
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Check if we're in private/incognito mode (storage quota is very limited)
const isPrivateMode = () => {
  try {
    const test = '__private_test__'
    window.localStorage.setItem(test, new Array(1024 * 10).join('x')) // 10KB test
    window.localStorage.removeItem(test)
    return false
  } catch {
    return true
  }
}

// Storage status for UI feedback
export const STORAGE_STATUS = {
  OK: 'ok',
  PRIVATE_MODE: 'private',
  UNAVAILABLE: 'unavailable',
  QUOTA_EXCEEDED: 'quota_exceeded',
}

// Get current storage status
export const getStorageStatus = () => {
  if (!isLocalStorageAvailable()) return STORAGE_STATUS.UNAVAILABLE
  if (isPrivateMode()) return STORAGE_STATUS.PRIVATE_MODE
  return STORAGE_STATUS.OK
}

// Event emitter for storage errors (components can subscribe)
const storageErrorListeners = new Set()

export const onStorageError = (callback) => {
  storageErrorListeners.add(callback)
  return () => storageErrorListeners.delete(callback)
}

const emitStorageError = (error, key) => {
  storageErrorListeners.forEach(callback => callback({ error, key }))
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (!isLocalStorageAvailable()) {
        return initialValue
      }
      const item = window.localStorage.getItem(key)
      if (item === null) return initialValue

      const parsed = JSON.parse(item)
      return parsed
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading "${key}":`, error.message)
      return initialValue
    }
  })

  // Track if this is the first render to avoid double-writes
  const isFirstRender = useRef(true)
  const previousKey = useRef(key)

  // Persist to localStorage
  useEffect(() => {
    // Skip first render (value was just read from storage)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // If key changed, reset first render flag
    if (previousKey.current !== key) {
      previousKey.current = key
      return
    }

    try {
      if (!isLocalStorageAvailable()) {
        emitStorageError(new Error('localStorage unavailable'), key)
        return
      }

      const serialized = JSON.stringify(storedValue)
      window.localStorage.setItem(key, serialized)
    } catch (error) {
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError' ||
          error.code === 22 || // Legacy Chrome
          error.code === 1014 || // Firefox
          (error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.error(`[useLocalStorage] Quota exceeded for "${key}"`)
        emitStorageError({ ...error, type: STORAGE_STATUS.QUOTA_EXCEEDED }, key)
      } else {
        console.error(`[useLocalStorage] Error writing "${key}":`, error.message)
        emitStorageError(error, key)
      }
    }
  }, [key, storedValue])

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch {
          // Ignore parse errors from other tabs
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  // Wrapped setter that handles errors gracefully
  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const nextValue = typeof value === 'function' ? value(prev) : value
      return nextValue
    })
  }, [])

  return [storedValue, setValue]
}
