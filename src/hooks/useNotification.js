import { useCallback, useEffect, useRef } from 'react'

export function useNotification() {
  const audioRef = useRef(null)

  useEffect(() => {
    // Create audio context for notification sound
    audioRef.current = new AudioContext()
  }, [])

  const playSound = useCallback(() => {
    if (!audioRef.current) return

    const ctx = audioRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Create a gentle bell sound
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1)

    // Second tone for pleasant chime
    setTimeout(() => {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc2.frequency.setValueAtTime(1320, ctx.currentTime) // E6
      osc2.type = 'sine'

      gain2.gain.setValueAtTime(0, ctx.currentTime)
      gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

      osc2.start(ctx.currentTime)
      osc2.stop(ctx.currentTime + 0.8)
    }, 150)
  }, [])

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

  const notify = useCallback((completedPhase) => {
    playSound()

    if (completedPhase === 'work') {
      showNotification('¡Pomodoro completado!', 'Tiempo de un descanso.')
    } else {
      showNotification('Descanso terminado', 'Vuelve al trabajo.')
    }
  }, [playSound, showNotification])

  return {
    notify,
    requestPermission,
    playSound,
  }
}
