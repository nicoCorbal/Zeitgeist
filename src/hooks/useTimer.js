import { useState, useEffect, useCallback, useRef } from 'react'

export function useTimer(onSessionComplete, onPhaseComplete, workDuration = 25 * 60, breakDuration = 5 * 60) {
  const [mode, setMode] = useState('pomodoro') // 'pomodoro' | 'free'
  const [phase, setPhase] = useState('work') // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(workDuration)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const intervalRef = useRef(null)
  const onPhaseCompleteRef = useRef(onPhaseComplete)
  const prevWorkDurationRef = useRef(workDuration)

  useEffect(() => {
    onPhaseCompleteRef.current = onPhaseComplete
  }, [onPhaseComplete])

  // Actualizar timer cuando cambia la duración (al cambiar de asignatura)
  useEffect(() => {
    if (!isRunning && mode === 'pomodoro' && prevWorkDurationRef.current !== workDuration) {
      setTimeLeft(phase === 'work' ? workDuration : breakDuration)
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
      setIsRunning(true)
    }
  }, [isRunning])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    setIsRunning(false)
    clearTimer()
    if (mode === 'pomodoro') {
      setPhase('work')
      setTimeLeft(workDuration)
    } else {
      setElapsedTime(0)
    }
  }, [mode, clearTimer, workDuration])

  // Reiniciar sin parar (para cambio de asignatura en focus mode)
  const restart = useCallback((newWorkDuration) => {
    if (mode === 'pomodoro') {
      setPhase('work')
      setTimeLeft(newWorkDuration || workDuration)
    }
  }, [mode, workDuration])

  const switchMode = useCallback((newMode) => {
    setIsRunning(false)
    clearTimer()
    setMode(newMode)
    if (newMode === 'pomodoro') {
      setPhase('work')
      setTimeLeft(workDuration)
    } else {
      setElapsedTime(0)
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
      setTimeLeft(workDuration)
      setIsRunning(false)
      clearTimer()
    }
  }, [mode, phase, workDuration, clearTimer])

  // Timer logic
  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      if (mode === 'pomodoro') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Session complete
            if (phase === 'work') {
              setPomodoroCount((c) => c + 1)
              completeSession(workDuration)
              setPhase('break')
              onPhaseCompleteRef.current?.('work')
              return breakDuration
            } else {
              setPhase('work')
              onPhaseCompleteRef.current?.('break')
              return workDuration
            }
          }
          return prev - 1
        })
      } else {
        setElapsedTime((prev) => prev + 1)
      }
    }, 1000)

    return clearTimer
  }, [isRunning, mode, phase, clearTimer, completeSession, workDuration, breakDuration])

  const displayTime = mode === 'pomodoro' ? timeLeft : elapsedTime
  const progress = mode === 'pomodoro'
    ? 1 - (timeLeft / (phase === 'work' ? workDuration : breakDuration))
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
