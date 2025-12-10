import { useState, useEffect, useCallback, useRef } from 'react'

export function useTimer(onSessionComplete, onPhaseComplete, workDuration = 25 * 60, breakDuration = 5 * 60) {
  const [mode, setMode] = useState('pomodoro') // 'pomodoro' | 'free'
  const [phase, setPhase] = useState('work') // 'work' | 'break'
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  // Tiempo basado en timestamps reales (no en intervalos)
  const [targetEndTime, setTargetEndTime] = useState(null) // Para pomodoro
  const [startTime, setStartTime] = useState(null) // Para modo libre
  const [pausedTimeLeft, setPausedTimeLeft] = useState(workDuration) // Tiempo restante al pausar
  const [pausedElapsed, setPausedElapsed] = useState(0) // Tiempo transcurrido al pausar

  const [displayTime, setDisplayTime] = useState(workDuration)

  const intervalRef = useRef(null)
  const onPhaseCompleteRef = useRef(onPhaseComplete)
  const prevWorkDurationRef = useRef(workDuration)

  useEffect(() => {
    onPhaseCompleteRef.current = onPhaseComplete
  }, [onPhaseComplete])

  // Actualizar timer cuando cambia la duración (al cambiar de asignatura)
  useEffect(() => {
    if (!isRunning && mode === 'pomodoro' && prevWorkDurationRef.current !== workDuration) {
      setPausedTimeLeft(phase === 'work' ? workDuration : breakDuration)
      setDisplayTime(phase === 'work' ? workDuration : breakDuration)
    }
    prevWorkDurationRef.current = workDuration
  }, [workDuration, breakDuration, isRunning, mode, phase])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (!isRunning) {
      const now = Date.now()
      if (mode === 'pomodoro') {
        // Calcular cuándo debe terminar basado en el tiempo restante
        setTargetEndTime(now + pausedTimeLeft * 1000)
      } else {
        // Guardar cuándo empezamos (ajustado por tiempo ya transcurrido)
        setStartTime(now - pausedElapsed * 1000)
      }
      setIsRunning(true)
    }
  }, [isRunning, mode, pausedTimeLeft, pausedElapsed])

  const pause = useCallback(() => {
    if (isRunning) {
      const now = Date.now()
      if (mode === 'pomodoro') {
        // Guardar tiempo restante real
        const remaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000))
        setPausedTimeLeft(remaining)
      } else {
        // Guardar tiempo transcurrido real
        const elapsed = Math.floor((now - startTime) / 1000)
        setPausedElapsed(elapsed)
      }
      setIsRunning(false)
      clearTimer()
    }
  }, [isRunning, mode, targetEndTime, startTime, clearTimer])

  const reset = useCallback(() => {
    setIsRunning(false)
    clearTimer()
    if (mode === 'pomodoro') {
      setPhase('work')
      setPausedTimeLeft(workDuration)
      setDisplayTime(workDuration)
      setTargetEndTime(null)
    } else {
      setPausedElapsed(0)
      setDisplayTime(0)
      setStartTime(null)
    }
  }, [mode, clearTimer, workDuration])

  // Reiniciar sin parar (para cambio de asignatura en focus mode)
  const restart = useCallback((newWorkDuration) => {
    if (mode === 'pomodoro') {
      const duration = newWorkDuration || workDuration
      setPhase('work')
      setPausedTimeLeft(duration)
      setDisplayTime(duration)
      if (isRunning) {
        setTargetEndTime(Date.now() + duration * 1000)
      }
    }
  }, [mode, workDuration, isRunning])

  const switchMode = useCallback((newMode) => {
    setIsRunning(false)
    clearTimer()
    setMode(newMode)
    if (newMode === 'pomodoro') {
      setPhase('work')
      setPausedTimeLeft(workDuration)
      setDisplayTime(workDuration)
      setTargetEndTime(null)
    } else {
      setPausedElapsed(0)
      setDisplayTime(0)
      setStartTime(null)
    }
  }, [clearTimer, workDuration])

  const completeSession = useCallback((duration) => {
    if (onSessionComplete && duration > 0) {
      onSessionComplete(duration)
    }
  }, [onSessionComplete])

  // Saltar el break y empezar nuevo pomodoro
  const skipBreak = useCallback(() => {
    if (mode === 'pomodoro' && phase === 'break') {
      setPhase('work')
      setPausedTimeLeft(workDuration)
      setDisplayTime(workDuration)
      setIsRunning(false)
      setTargetEndTime(null)
      clearTimer()
    }
  }, [mode, phase, workDuration, clearTimer])

  // Timer logic - actualiza display basado en tiempo real
  useEffect(() => {
    if (!isRunning) return

    const tick = () => {
      const now = Date.now()

      if (mode === 'pomodoro') {
        const remaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000))
        setDisplayTime(remaining)

        if (remaining <= 0) {
          // Session complete
          if (phase === 'work') {
            setPomodoroCount((c) => c + 1)
            completeSession(workDuration)
            setPhase('break')
            setPausedTimeLeft(breakDuration)
            setTargetEndTime(now + breakDuration * 1000)
            onPhaseCompleteRef.current?.('work')
          } else {
            setPhase('work')
            setPausedTimeLeft(workDuration)
            setTargetEndTime(now + workDuration * 1000)
            onPhaseCompleteRef.current?.('break')
          }
        }
      } else {
        const elapsed = Math.floor((now - startTime) / 1000)
        setDisplayTime(elapsed)
        setPausedElapsed(elapsed)
      }
    }

    // Tick inmediato y luego cada 100ms para mayor precisión
    tick()
    intervalRef.current = setInterval(tick, 100)

    return clearTimer
  }, [isRunning, mode, phase, targetEndTime, startTime, clearTimer, completeSession, workDuration, breakDuration])

  const elapsedTime = mode === 'free' ? displayTime : 0
  const progress = mode === 'pomodoro'
    ? 1 - (displayTime / (phase === 'work' ? workDuration : breakDuration))
    : null

  return {
    mode,
    phase,
    displayTime,
    elapsedTime,
    isRunning,
    progress,
    pomodoroCount,
    start,
    pause,
    reset,
    restart,
    switchMode,
    skipBreak,
    completeSession,
  }
}
