import { useCallback } from 'react'
import { playSound } from '../data/sounds'

export function useNotification() {
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        silent: true,
      })
    }
  }, [])

  const notify = useCallback((completedPhase, soundType = 'bell') => {
    playSound(soundType)

    if (completedPhase === 'work') {
      showNotification('¡Pomodoro completado!', 'Tiempo de un descanso.')
    } else {
      showNotification('Descanso terminado', 'Vuelve al trabajo.')
    }
  }, [showNotification])

  return {
    notify,
    requestPermission,
  }
}
