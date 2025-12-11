import { useCallback } from 'react'
import { playSound, playSuccessSound, playBreakSound } from '../data/sounds'

export function useNotification() {
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch (e) {
        console.warn('[Notification] Permission request failed:', e)
      }
    }
  }, [])

  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          silent: true, // We handle sound separately
          tag: 'denso-timer', // Replaces previous notification
        })
      } catch (e) {
        console.warn('[Notification] Failed to show notification:', e)
      }
    }
  }, [])

  const notify = useCallback((completedPhase, soundType = 'bell') => {
    // Play appropriate sound based on phase
    if (completedPhase === 'work') {
      // Work completed - play success sound or custom sound
      if (soundType === 'bell' || soundType === 'chime') {
        playSuccessSound() // Two-tone celebration
      } else {
        playSound(soundType)
      }
      showNotification('¡Pomodoro completado!', 'Tiempo de un descanso.')
    } else {
      // Break completed - play break sound or custom sound
      if (soundType === 'bell' || soundType === 'chime') {
        playBreakSound() // Descending notes
      } else {
        playSound(soundType)
      }
      showNotification('Descanso terminado', 'Vuelve al trabajo.')
    }
  }, [showNotification])

  // Notify for milestones (streaks, achievements)
  const notifyMilestone = useCallback((title, body) => {
    playSuccessSound()
    showNotification(title, body)
  }, [showNotification])

  return {
    notify,
    notifyMilestone,
    requestPermission,
  }
}
