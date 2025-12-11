import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, ChevronDown, Play, Pause, Plus, X, Settings, RotateCcw, Check, ChevronRight, ArrowLeft, BarChart2 } from 'lucide-react'
import { useStats } from './hooks/useStats'
import { useTimer } from './hooks/useTimer'
import { useTheme } from './hooks/useTheme'
import { useNotification } from './hooks/useNotification'
import { useToast } from './hooks/useToast'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useHaptics } from './hooks/useHaptics'
import { useOnboarding } from './hooks/useOnboarding'
import { useAchievements } from './hooks/useAchievements'
import { Confetti, useCelebration } from './components/Confetti'
import { Toast } from './components/Toast'
import { OfflineBanner } from './components/OfflineBanner'
import { Onboarding } from './components/Onboarding'
import { AchievementToast } from './components/AchievementToast'
import { EnergyCheck } from './components/EnergyCheck'
import { BreathingRitual } from './components/BreathingRitual'
import { SessionReflection } from './components/SessionReflection'
import { formatTime, formatDuration } from './utils/time'
import './index.css'

// Lazy load heavy panels
const StatsPanel = lazy(() => import('./components/StatsPanel').then(m => ({ default: m.StatsPanel })))
const SettingsPanel = lazy(() => import('./components/SettingsPanel').then(m => ({ default: m.SettingsPanel })))

// Animated digit component with smooth slide
function Digit({ value }) {
  return (
    <span className="relative inline-flex h-[1em] w-[0.6em] items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="absolute"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function AnimatedTime({ time }) {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  const s1 = Math.floor(seconds / 10)
  const s2 = seconds % 10

  // Soporta hasta 999 minutos
  const m1 = Math.floor(minutes / 100)
  const m2 = Math.floor((minutes % 100) / 10)
  const m3 = minutes % 10

  return (
    <span className="inline-flex items-center">
      {m1 > 0 && <Digit value={m1} />}
      {(m1 > 0 || m2 > 0) && <Digit value={m2} />}
      <Digit value={m3} />
      <span className="mx-[0.05em] h-[1em] flex items-center">:</span>
      <Digit value={s1} />
      <Digit value={s2} />
    </span>
  )
}

function App() {
  const [showSubjects, setShowSubjects] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [viewingTodosFor, setViewingTodosFor] = useState(null) // ID de asignatura para ver todos
  const [newTodoText, setNewTodoText] = useState('')
  const [soundEnabled, setSoundEnabled] = useLocalStorage('zeitgeist-sound', true)
  const [soundType, setSoundType] = useLocalStorage('zeitgeist-sound-type', 'bell')
  const [deepFocusEnabled, setDeepFocusEnabled] = useLocalStorage('zeitgeist-deep-focus', false)
  const [dailyGoal, setDailyGoal] = useLocalStorage('zeitgeist-daily-goal', 2 * 60 * 60) // 2 hours default

  // Energy-aware focus state
  const [showEnergyCheck, setShowEnergyCheck] = useState(false)
  const [showBreathingRitual, setShowBreathingRitual] = useState(false)
  const [showSessionReflection, setShowSessionReflection] = useState(false)
  const [currentEnergy, setCurrentEnergy] = useState(null)
  const [pendingSessionDuration, setPendingSessionDuration] = useState(null)

  const { theme, setTheme, toggle: toggleTheme, isDark } = useTheme()
  const { notify, requestPermission } = useNotification()
  const { toast, show: showToast } = useToast()
  const haptics = useHaptics()
  const celebration = useCelebration()
  const { showOnboarding, completeOnboarding } = useOnboarding()
  const {
    sessions,
    subjects,
    currentSubject,
    weeklyGoal,
    stats,
    addSession,
    addSubject,
    updateSubject,
    setCurrentSubject,
    setWeeklyGoal,
    addTodo,
    toggleTodo,
    deleteTodo,
  } = useStats()

  // Achievement notifications
  const { newAchievement, showAchievementToast, dismissAchievement } = useAchievements(sessions, stats)

  const current = subjects.find((s) => s.id === currentSubject)
  const workDuration = current?.workDuration || 25 * 60
  const breakDuration = current?.breakDuration || 5 * 60
  const longBreakDuration = current?.longBreakDuration || 15 * 60
  const longBreakInterval = current?.longBreakInterval ?? 4

  const handlePhaseComplete = useCallback((phase, duration) => {
    if (soundEnabled) notify(phase, soundType)
    // Haptic feedback for work completion
    if (phase === 'work') {
      haptics.success()
      // Show reflection instead of immediate toast
      setPendingSessionDuration(duration || workDuration)
      setShowSessionReflection(true)
    } else {
      haptics.medium()
      showToast('Descanso terminado')
    }
  }, [notify, soundEnabled, soundType, showToast, haptics, workDuration])

  const timer = useTimer(addSession, handlePhaseComplete, workDuration, breakDuration, longBreakDuration, longBreakInterval)

  const currentSessionTime = timer.isRunning
    ? timer.mode === 'pomodoro'
      ? timer.phase === 'work' ? workDuration - timer.displayTime : 0
      : timer.elapsedTime
    : 0

  // Dynamic title
  useEffect(() => {
    document.title = timer.isRunning
      ? `${formatTime(timer.displayTime)} · Denso`
      : 'Denso'
  }, [timer.displayTime, timer.isRunning])

  // Request notifications
  useEffect(() => {
    const handler = () => { requestPermission(); window.removeEventListener('click', handler) }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [requestPermission])

  const handleToggle = useCallback(() => {
    haptics.light()
    if (timer.isRunning) {
      timer.pause()
    } else {
      // Show energy check before starting (only for pomodoro mode, work phase)
      if (timer.mode === 'pomodoro' && timer.phase === 'work' && !currentEnergy) {
        setShowEnergyCheck(true)
      } else {
        timer.start()
      }
    }
  }, [haptics, timer.isRunning, timer.pause, timer.start, timer.mode, timer.phase, currentEnergy])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        handleToggle()
      }
      if (e.key === 'r' || e.key === 'R') timer.reset()
      if (e.key === 's' || e.key === 'S') timer.skipBreak()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [timer.reset, timer.skipBreak, handleToggle])

  // Handle energy selection
  const handleEnergySelect = (energy) => {
    setCurrentEnergy(energy)
    setShowEnergyCheck(false)
    // Apply suggested duration based on energy level
    timer.restart(energy.suggestedMinutes * 60)
    setShowBreathingRitual(true)
  }

  // Handle energy skip
  const handleEnergySkip = () => {
    setShowEnergyCheck(false)
    timer.start()
  }

  // Handle breathing complete
  const handleBreathingComplete = () => {
    setShowBreathingRitual(false)
    timer.start()
  }

  // Handle session reflection
  const handleReflectionSelect = (flowLevel) => {
    setShowSessionReflection(false)
    celebration.celebrate()
    showToast('Pomodoro completado')

    // Add session with energy and flow data
    addSession(
      pendingSessionDuration || workDuration,
      currentSubject,
      currentEnergy?.id || null,
      flowLevel?.value || null
    )

    // Reset energy for next session
    setCurrentEnergy(null)
    setPendingSessionDuration(null)
  }

  const handleSave = () => {
    if (timer.mode === 'free' && timer.elapsedTime > 60 && !timer.isRunning) {
      haptics.success()
      celebration.celebrate()
      timer.completeSession(timer.elapsedTime)
      timer.reset()
      showToast('Sesión guardada')
    }
  }

  const handleReset = () => {
    haptics.medium()
    timer.reset()
  }

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      haptics.light()
      addSubject(newSubject.trim())
      setNewSubject('')
      setIsAddingSubject(false)
    }
  }

  const weekProgress = Math.min((stats.weekTotal + currentSessionTime) / weeklyGoal, 1)
  const dayProgress = Math.min((stats.todayTotal + currentSessionTime) / dailyGoal, 1)
  const canSave = timer.mode === 'free' && timer.elapsedTime > 60 && !timer.isRunning
  const isFocusMode = timer.isRunning && timer.mode === 'pomodoro' && timer.phase === 'work'
  const isBreakMode = timer.isRunning && timer.mode === 'pomodoro' && timer.phase === 'break'
  const isDeepFocus = isFocusMode && deepFocusEnabled

  // Handler for onboarding subject creation
  const handleOnboardingAddSubject = (name, emoji) => {
    addSubject(name, emoji)
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={completeOnboarding}
        onGoalChange={setWeeklyGoal}
        onAddSubject={handleOnboardingAddSubject}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-500">
      {/* Skip link for keyboard users */}
      <a href="#main-timer" className="skip-link">
        Saltar al temporizador
      </a>

      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
        style={{ paddingTop: 'max(16px, var(--safe-area-top))' }}
        animate={{
          opacity: isDeepFocus ? 0 : 1,
          pointerEvents: isDeepFocus ? 'none' : 'auto'
        }}
        transition={{ duration: 0.4 }}
      >
        <img src="/logo.svg" alt="Denso" className="h-8" style={{ filter: 'var(--logo-filter)' }} />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowStats(true)}
            className="p-2 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]"
            aria-label="Ver estadísticas"
          >
            <BarChart2 size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]"
            aria-label="Abrir ajustes"
          >
            <Settings size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]"
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {isDark ? <Sun size={16} strokeWidth={1.5} aria-hidden="true" /> : <Moon size={16} strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
      </motion.header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center">

          {/* Subject selector */}
          <motion.div
            className="relative mb-6"
            animate={{
              opacity: (isFocusMode || isBreakMode) ? 0 : 1,
              height: (isFocusMode || isBreakMode) ? 0 : 'auto',
              marginBottom: (isFocusMode || isBreakMode) ? 0 : 24
            }}
            transition={{
              opacity: { duration: 0.15, delay: (isFocusMode || isBreakMode) ? 0 : 0.2 },
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 },
              marginBottom: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 }
            }}
          >
            <button
              onClick={() => setShowSubjects(!showSubjects)}
              className="flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
            >
              {current?.emoji && <span>{current.emoji}</span>}
              {current?.name || 'General'}
              <ChevronDown size={14} className={`transition-transform ${showSubjects ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSubjects && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => { setShowSubjects(false); setIsAddingSubject(false); setViewingTodosFor(null); setNewTodoText('') }} />
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--bg)] py-1 shadow-lg"
                  >
                    {viewingTodosFor ? (
                      // Vista de todos de una asignatura
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
                          <button
                            onClick={() => { setViewingTodosFor(null); setNewTodoText('') }}
                            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text)]"
                          >
                            <ArrowLeft size={14} />
                          </button>
                          <span className="text-[13px] font-medium text-[var(--text)]">
                            {subjects.find(s => s.id === viewingTodosFor)?.emoji} {subjects.find(s => s.id === viewingTodosFor)?.name}
                          </span>
                        </div>
                        <div className="max-h-64 overflow-y-auto py-1">
                          {subjects.find(s => s.id === viewingTodosFor)?.todos?.filter(t => !t.completed).map((todo) => (
                            <button
                              key={todo.id}
                              onClick={() => toggleTodo(viewingTodosFor, todo.id)}
                              className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                            >
                              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[var(--border)]" />
                              <span className="text-[13px] text-[var(--text)]">{todo.text}</span>
                            </button>
                          ))}
                          {subjects.find(s => s.id === viewingTodosFor)?.todos?.filter(t => t.completed).length > 0 && (
                            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                              Completadas
                            </div>
                          )}
                          {subjects.find(s => s.id === viewingTodosFor)?.todos?.filter(t => t.completed).map((todo) => (
                            <div
                              key={todo.id}
                              className="group flex w-full items-center gap-3 px-3 py-2 transition-colors hover:bg-[var(--bg-secondary)]"
                            >
                              <button
                                onClick={() => toggleTodo(viewingTodosFor, todo.id)}
                                className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[var(--text)] bg-[var(--text)]"
                              >
                                <Check size={10} className="text-[var(--bg)]" />
                              </button>
                              <span className="flex-1 text-[13px] text-[var(--text-tertiary)] line-through">{todo.text}</span>
                              <button
                                onClick={() => deleteTodo(viewingTodosFor, todo.id)}
                                className="p-1 text-[var(--text-tertiary)] opacity-0 transition-opacity hover:text-[var(--text)] group-hover:opacity-100"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {(!subjects.find(s => s.id === viewingTodosFor)?.todos || subjects.find(s => s.id === viewingTodosFor)?.todos.length === 0) && (
                            <p className="px-3 py-4 text-center text-[12px] text-[var(--text-tertiary)]">Sin tareas</p>
                          )}
                        </div>
                        <div className="border-t border-[var(--border)] px-3 py-2">
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            if (newTodoText.trim()) {
                              addTodo(viewingTodosFor, newTodoText.trim())
                              setNewTodoText('')
                            }
                          }}>
                            <input
                              type="text"
                              value={newTodoText}
                              onChange={(e) => setNewTodoText(e.target.value)}
                              placeholder="Nueva tarea..."
                              className="w-full border-none bg-transparent text-[13px] outline-none ring-0 focus:border-none focus:outline-none focus:ring-0 placeholder:text-[var(--text-tertiary)]"
                            />
                          </form>
                        </div>
                      </>
                    ) : (
                      // Lista de asignaturas
                      <>
                        {subjects.map((s) => (
                          <div
                            key={s.id}
                            className={`flex items-center px-3 py-2 transition-colors hover:bg-[var(--bg-secondary)] ${
                              s.id === currentSubject ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            <button
                              onClick={() => { setCurrentSubject(s.id); setShowSubjects(false) }}
                              className="flex flex-1 items-center gap-2 text-left text-[13px]"
                            >
                              {s.emoji && <span>{s.emoji}</span>}
                              {s.name}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingTodosFor(s.id)
                              }}
                              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text)]"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        ))}
                        <div className="border-t border-[var(--border)] mt-1 pt-1">
                          {isAddingSubject ? (
                            <div className="flex items-center gap-2 px-3 py-2">
                              <input
                                type="text"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddSubject()
                                  if (e.key === 'Escape') { setIsAddingSubject(false); setNewSubject('') }
                                }}
                                placeholder="Nombre..."
                                className="flex-1 border-none bg-transparent text-[13px] outline-none ring-0 focus:border-none focus:outline-none focus:ring-0 placeholder:text-[var(--text-tertiary)]"
                                autoFocus
                              />
                              <button onClick={() => { setIsAddingSubject(false); setNewSubject('') }}>
                                <X size={14} className="text-[var(--text-tertiary)]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsAddingSubject(true)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                            >
                              <Plus size={14} />
                              Nueva materia
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Timer - grows when in focus mode, smaller in break */}
          <div className="flex flex-col items-center">
            <AnimatePresence>
              {isBreakMode && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-2 text-[13px] font-medium tracking-wide text-[var(--text-tertiary)]"
                >
                  break!
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button
              id="main-timer"
              onClick={handleToggle}
              className="select-none font-semibold leading-none tracking-[-0.02em] tabular-nums outline-none"
              animate={{
                fontSize: isFocusMode
                  ? 'min(200px, 25vw)'
                  : isBreakMode
                    ? 'min(100px, 15vw)'
                    : 'min(140px, 20vw)'
              }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              aria-label={`${timer.isRunning ? 'Pausar' : 'Iniciar'} temporizador. Tiempo: ${formatTime(timer.displayTime)}`}
              aria-live="polite"
            >
              <AnimatedTime time={timer.displayTime} />
            </motion.button>
            <AnimatePresence>
              {isBreakMode && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  onClick={timer.skipBreak}
                  className="mt-4 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  aria-label="Saltar descanso e iniciar nueva sesión"
                >
                  saltar →
                </motion.button>
              )}
            </AnimatePresence>

          </div>

          {/* Mode toggle */}
          <motion.div
            className="flex items-center gap-3 text-[13px] text-[var(--text-tertiary)]"
            animate={{
              opacity: (isFocusMode || isBreakMode) ? 0 : 1,
              height: (isFocusMode || isBreakMode) ? 0 : 'auto',
              marginTop: (isFocusMode || isBreakMode) ? 0 : 24
            }}
            transition={{
              opacity: { duration: 0.15, delay: (isFocusMode || isBreakMode) ? 0 : 0.2 },
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 },
              marginTop: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 }
            }}
          >
            <button
              onClick={() => timer.switchMode('pomodoro')}
              className={`transition-colors ${timer.mode === 'pomodoro' ? 'text-[var(--text-secondary)]' : 'hover:text-[var(--text-secondary)]'}`}
            >
              Pomodoro
            </button>
            <span>/</span>
            <button
              onClick={() => timer.switchMode('free')}
              className={`transition-colors ${timer.mode === 'free' ? 'text-[var(--text-secondary)]' : 'hover:text-[var(--text-secondary)]'}`}
            >
              Libre
            </button>
          </motion.div>

          {/* Controls */}
          <motion.div
            className="flex items-center gap-4"
            animate={{
              opacity: (isFocusMode || isBreakMode) ? 0 : 1,
              height: (isFocusMode || isBreakMode) ? 0 : 'auto',
              marginTop: (isFocusMode || isBreakMode) ? 0 : 40
            }}
            transition={{
              opacity: { duration: 0.15, delay: (isFocusMode || isBreakMode) ? 0 : 0.2 },
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 },
              marginTop: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 }
            }}
          >
            <button
              onClick={handleReset}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-tertiary)] hover:text-[var(--text)]"
              aria-label="Reiniciar temporizador"
            >
              <RotateCcw size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleToggle}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)]"
              aria-label={timer.isRunning ? 'Pausar temporizador' : 'Iniciar temporizador'}
            >
              {timer.isRunning ? <Pause size={22} aria-hidden="true" /> : <Play size={22} className="ml-0.5" aria-hidden="true" />}
            </motion.button>

            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
                canSave
                  ? 'border-[var(--text)] text-[var(--text)]'
                  : 'pointer-events-none border-[var(--border)] text-[var(--border)]'
              }`}
              aria-label="Guardar sesión"
              aria-disabled={!canSave}
            >
              <Check size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <motion.footer
        className="flex items-center justify-center gap-2 px-4 py-4 text-[11px] tabular-nums text-[var(--text-tertiary)] sm:gap-4 sm:px-6 sm:py-5 sm:text-[12px]"
        style={{ paddingBottom: 'max(16px, var(--safe-area-bottom))' }}
        aria-label="Resumen de progreso"
        animate={{
          opacity: isDeepFocus ? 0 : 1,
          pointerEvents: isDeepFocus ? 'none' : 'auto'
        }}
        transition={{ duration: 0.4 }}
      >
        <span aria-label={`Racha de ${stats.streak} días consecutivos`}>{stats.streak} días</span>
        <span className="text-[var(--border)]">·</span>
        {/* Daily progress */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-1 w-10 rounded-full bg-[var(--border)] sm:w-12"
            role="progressbar"
            aria-valuenow={Math.round(dayProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso diario"
          >
            <motion.div
              className="h-full rounded-full bg-[var(--text-tertiary)]"
              animate={{ width: `${dayProgress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="hidden sm:inline">hoy</span>
        </div>
        <span className="text-[var(--border)]">·</span>
        {/* Weekly progress */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-1 w-10 rounded-full bg-[var(--border)] sm:w-12"
            role="progressbar"
            aria-valuenow={Math.round(weekProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso semanal"
          >
            <motion.div
              className="h-full rounded-full bg-[var(--text-tertiary)]"
              animate={{ width: `${weekProgress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span>{formatDuration(stats.weekTotal + currentSessionTime)}</span>
        </div>
      </motion.footer>

      {/* Panels - lazy loaded */}
      <Suspense fallback={null}>
        <StatsPanel isOpen={showStats} onClose={() => setShowStats(false)} stats={stats} subjects={subjects} weeklyGoal={weeklyGoal} sessions={sessions} />
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          weeklyGoal={weeklyGoal}
          onWeeklyGoalChange={setWeeklyGoal}
          soundEnabled={soundEnabled}
          onSoundToggle={() => setSoundEnabled(!soundEnabled)}
          soundType={soundType}
          onSoundTypeChange={setSoundType}
          currentSubject={current}
          onSubjectUpdate={(updates) => updateSubject(currentSubject, updates)}
          theme={theme}
          onThemeChange={setTheme}
          deepFocusEnabled={deepFocusEnabled}
          onDeepFocusToggle={() => setDeepFocusEnabled(!deepFocusEnabled)}
          dailyGoal={dailyGoal}
          onDailyGoalChange={setDailyGoal}
        />
      </Suspense>

      {/* Focus mode panels - simétrico: asignaturas izquierda, todos derecha (hidden in deep focus) */}
      <AnimatePresence>
        {isFocusMode && !isDeepFocus && (
          <>
            {/* Selector de asignaturas - izquierda (oculto en móvil) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:block"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-3 px-1 text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]"
              >
                Asignaturas
              </motion.p>
              <div className="space-y-0.5">
                {subjects.map((s, index) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.04, ease: [0.23, 1, 0.32, 1] }}
                    onClick={() => {
                      if (s.id !== currentSubject) {
                        setCurrentSubject(s.id)
                        timer.restart(s.workDuration || 25 * 60)
                      }
                    }}
                    className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all duration-200 ${
                      s.id === currentSubject
                        ? 'bg-[var(--text)] text-[var(--bg)]'
                        : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {s.emoji ? (
                      <span className="text-sm">{s.emoji}</span>
                    ) : (
                      <span className={`h-2 w-2 rounded-full ${s.id === currentSubject ? 'bg-[var(--bg)]' : 'bg-[var(--text-tertiary)]'}`} style={s.id !== currentSubject && s.color ? { backgroundColor: s.color } : {}} />
                    )}
                    <span className="truncate text-[13px] font-medium">{s.name}</span>
                    <span className={`ml-auto text-[11px] tabular-nums ${s.id === currentSubject ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`}>
                      {Math.round((s.workDuration || 25 * 60) / 60)}m
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Todos - derecha (oculto en móvil) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="fixed right-4 top-1/2 -translate-y-1/2 hidden lg:block"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-3 px-1 text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]"
              >
                Tareas
              </motion.p>
              {current?.todos?.filter(t => !t.completed).length > 0 ? (
                <div className="space-y-0.5">
                  {current.todos.filter(t => !t.completed).slice(0, 5).map((todo, index) => (
                    <motion.button
                      key={todo.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.04, ease: [0.23, 1, 0.32, 1] }}
                      onClick={() => toggleTodo(currentSubject, todo.id)}
                      className="group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all duration-200 hover:bg-[var(--bg-secondary)]"
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div
                        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[var(--border)] transition-colors group-hover:border-[var(--text-tertiary)]"
                        whileHover={{ scale: 1.1 }}
                      />
                      <span className="truncate text-[13px] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text)]">
                        {todo.text}
                      </span>
                    </motion.button>
                  ))}
                  {current.todos.filter(t => !t.completed).length > 5 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="px-2.5 pt-1 text-[11px] text-[var(--text-tertiary)]"
                    >
                      +{current.todos.filter(t => !t.completed).length - 5} más
                    </motion.p>
                  )}
                </div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-1 text-[12px] text-[var(--text-tertiary)]"
                >
                  Sin tareas pendientes
                </motion.p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Celebration animation */}
      <Confetti
        isActive={celebration.isActive}
        onComplete={celebration.reset}
        color="var(--text)"
      />

      {/* Offline indicator */}
      <OfflineBanner />

      {/* Achievement notification */}
      <AchievementToast
        achievement={newAchievement}
        isVisible={showAchievementToast}
        onComplete={dismissAchievement}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} />

      {/* Energy-aware focus flow */}
      <AnimatePresence>
        {showEnergyCheck && (
          <EnergyCheck
            onSelect={handleEnergySelect}
            onSkip={handleEnergySkip}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBreathingRitual && (
          <BreathingRitual
            onComplete={handleBreathingComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSessionReflection && (
          <SessionReflection
            onSelect={handleReflectionSelect}
            duration={pendingSessionDuration}
            energyLevel={currentEnergy}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
