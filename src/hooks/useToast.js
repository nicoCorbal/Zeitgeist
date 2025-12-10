import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false })
  const timeoutRef = useRef(null)

  const show = useCallback((message, type = 'success', duration = 2000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setToast({ message, type, isVisible: true })

    timeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }))
    }, duration)
  }, [])

  const hide = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }, [])

  return { toast, show, hide }
}
