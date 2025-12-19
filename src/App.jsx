import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Play, Pause, Plus, X, Settings, RotateCcw, Check, ArrowLeft, BarChart2, Trash2, CheckSquare, Pencil, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStats } from './hooks/useStats'
import { useTimer } from './hooks/useTimer'
import { useTheme } from './hooks/useTheme'
import { useNotification } from './hooks/useNotification'
import { useToast } from './hooks/useToast'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useHaptics } from './hooks/useHaptics'
import { useOnboarding } from './hooks/useOnboarding'
import { useAchievements } from './hooks/useAchievements'
import { Confetti } from './components/Confetti'
import { useCelebration } from './hooks/useCelebration'
import { Toast } from './components/Toast'
import { OfflineBanner } from './components/OfflineBanner'
import { Onboarding } from './components/Onboarding'
import { AchievementToast } from './components/AchievementToast'
import { Landing } from './components/Landing'
import { Privacy } from './components/Privacy'
import { formatTime, formatDuration } from './utils/time'
import { EMOJIS } from './data/emojis'
import './index.css'

// Lazy load heavy panels
const StatsPanel = lazy(() => import('./components/StatsPanel').then(m => ({ default: m.StatsPanel })))
const SettingsPanel = lazy(() => import('./components/SettingsPanel').then(m => ({ default: m.SettingsPanel })))
const CalendarPanel = lazy(() => import('./components/CalendarPanel').then(m => ({ default: m.CalendarPanel })))

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

function TimerApp() {
  const { t } = useTranslation()
  const [showSubjects, setShowSubjects] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newSubjectEmoji, setNewSubjectEmoji] = useState(null)
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [showStats, setShowStats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [viewingTodosFor, setViewingTodosFor] = useState(null) // ID de asignatura para ver todos
  const [newTodoText, setNewTodoText] = useState('')
  const [subjectToDelete, setSubjectToDelete] = useState(null) // Para modal de confirmación
  const [soundEnabled, setSoundEnabled] = useLocalStorage('denso-sound', true)
  const [soundType, setSoundType] = useLocalStorage('denso-sound-type', 'bell')
  const [deepFocusEnabled, setDeepFocusEnabled] = useLocalStorage('denso-deep-focus', false)
  const [dailyGoal, setDailyGoal] = useLocalStorage('denso-daily-goal', 2 * 60 * 60) // 2 hours default


  const { theme, setTheme } = useTheme()
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
    deleteSubject,
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
    if (phase === 'work') {
      haptics.success()
      celebration.celebrate()
      addSession(duration || workDuration)
      showToast(t('toast.pomodoroComplete'))
    } else {
      haptics.medium()
      showToast(t('toast.breakComplete'))
    }
  }, [notify, soundEnabled, soundType, showToast, haptics, workDuration, celebration, addSession])

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
      timer.start()
    }
  }, [haptics, timer.isRunning, timer.pause, timer.start])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        document.activeElement?.blur()
        handleToggle()
      }
      if (e.key === 'r' || e.key === 'R') timer.reset()
      if (e.key === 's' || e.key === 'S') timer.skipBreak()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [timer.reset, timer.skipBreak, handleToggle])

  const handleSave = () => {
    if (timer.mode === 'free' && timer.elapsedTime > 60 && !timer.isRunning) {
      haptics.success()
      celebration.celebrate()
      timer.completeSession(timer.elapsedTime)
      timer.reset()
      showToast(t('toast.sessionSaved'))
    }
  }

  const handleReset = () => {
    haptics.medium()
    timer.reset()
  }

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      haptics.light()
      addSubject(newSubject.trim(), newSubjectEmoji)
      setNewSubject('')
      setNewSubjectEmoji(null)
      setIsAddingSubject(false)
      setShowEmojiPicker(false)
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text)] transition-colors duration-500">
      {/* Skip link for keyboard users */}
      <a href="#main-timer" className="skip-link">
        {t('timer.skipToTimer')}
      </a>

      {/* Header */}
      <motion.header
        className="flex flex-shrink-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-5"
        style={{ paddingTop: 'max(12px, var(--safe-area-top))' }}
        animate={{
          opacity: isDeepFocus ? 0 : 1,
          pointerEvents: isDeepFocus ? 'none' : 'auto'
        }}
        transition={{ duration: 0.4 }}
      >
        <img src="/logo.svg" alt="Denso" className="h-8" style={{ filter: 'var(--logo-filter)' }} />
        <motion.div
          className="flex items-center gap-1"
          animate={{ opacity: timer.isRunning ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          style={{ pointerEvents: timer.isRunning ? 'none' : 'auto' }}
        >
          <button
            onClick={(e) => { e.currentTarget.blur(); setShowCalendar(true) }}
            className="p-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            aria-label={t('nav.openCalendar')}
          >
            <Calendar size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            onClick={(e) => { e.currentTarget.blur(); setShowStats(true) }}
            className="p-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            aria-label={t('nav.viewStats')}
          >
            <BarChart2 size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            onClick={(e) => { e.currentTarget.blur(); setShowSettings(true) }}
            className="p-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            aria-label={t('nav.openSettings')}
          >
            <Settings size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </motion.div>
      </motion.header>

      {/* Main */}
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center">

          {/* Subject selector */}
          <motion.div
            className="relative mb-4 sm:mb-6"
            animate={{
              opacity: (isFocusMode || isBreakMode) ? 0 : 1,
              height: (isFocusMode || isBreakMode) ? 0 : 'auto',
              marginBottom: (isFocusMode || isBreakMode) ? 0 : undefined
            }}
            transition={{
              opacity: { duration: 0.15, delay: (isFocusMode || isBreakMode) ? 0 : 0.2 },
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 },
              marginBottom: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: (isFocusMode || isBreakMode) ? 0.08 : 0 }
            }}
          >
            <button
              onClick={() => setShowSubjects(!showSubjects)}
              className="flex items-center gap-2 text-[15px] font-normal text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
            >
              {current?.emoji && <span>{current.emoji}</span>}
              {current?.name || t('subjects.general')}
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
                    className="absolute left-1/2 top-full z-20 mt-2 w-[calc(100vw-2rem)] max-w-80 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg"
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
                        <div className="max-h-64 overflow-y-auto p-1">
                          {subjects.find(s => s.id === viewingTodosFor)?.todos?.filter(task => !task.completed).map((todo) => (
                            <button
                              key={todo.id}
                              onClick={() => toggleTodo(viewingTodosFor, todo.id)}
                              className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                            >
                              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[var(--border)]" />
                              <span className="text-[13px] text-[var(--text)]">{todo.text}</span>
                            </button>
                          ))}
                          {subjects.find(s => s.id === viewingTodosFor)?.todos?.filter(task => task.completed).length > 0 && (
                            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                              {t('todos.completed')}
                            </div>
                          )}
                          {subjects.find(s => s.id === viewingTodosFor)?.todos?.filter(task => task.completed).map((todo) => (
                            <div
                              key={todo.id}
                              className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--bg-secondary)]"
                            >
                              <button
                                onClick={() => toggleTodo(viewingTodosFor, todo.id)}
                                className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[var(--text)] bg-[var(--text)]"
                              >
                                <Check size={10} className="text-[var(--bg-solid)]" />
                              </button>
                              <span className="flex-1 text-[13px] text-[var(--text-tertiary)] line-through">{todo.text}</span>
                              <button
                                onClick={() => deleteTodo(viewingTodosFor, todo.id)}
                                className="p-1 text-[var(--text-tertiary)] opacity-100 transition-opacity hover:text-[var(--text)] md:opacity-0 md:group-hover:opacity-100"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {(!subjects.find(s => s.id === viewingTodosFor)?.todos || subjects.find(s => s.id === viewingTodosFor)?.todos.length === 0) && (
                            <p className="px-2 py-4 text-center text-[12px] text-[var(--text-tertiary)]">{t('todos.empty')}</p>
                          )}
                        </div>
                        <div className="border-t border-[var(--border)] p-2">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              if (newTodoText.trim()) {
                                addTodo(viewingTodosFor, newTodoText.trim())
                                setNewTodoText('')
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={newTodoText}
                              onChange={(e) => setNewTodoText(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              placeholder={t('todos.newTask')}
                              className="flex-1 rounded-md border border-[var(--border)] bg-transparent px-2.5 py-1.5 text-[13px] text-[var(--text)] outline-none focus:border-[var(--text-tertiary)] placeholder:text-[var(--text-tertiary)]"
                            />
                            <button
                              type="submit"
                              disabled={!newTodoText.trim()}
                              className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--text)] text-[var(--bg)] disabled:opacity-30"
                            >
                              <Plus size={16} />
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      // Lista de asignaturas
                      <div className="p-1">
                        {subjects.map((s) => (
                          <div
                            key={s.id}
                            className={`group flex items-center rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--bg-secondary)] ${
                              s.id === currentSubject ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {editingSubject === s.id ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  if (editingName.trim()) {
                                    updateSubject(s.id, { name: editingName.trim() })
                                    setEditingSubject(null)
                                    setEditingName('')
                                  }
                                }}
                                className="flex flex-1 items-center gap-2"
                              >
                                {s.emoji && <span>{s.emoji}</span>}
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    e.stopPropagation()
                                    if (e.key === 'Escape') {
                                      setEditingSubject(null)
                                      setEditingName('')
                                    }
                                  }}
                                  className="flex-1 border-none bg-transparent text-[13px] text-[var(--text)] outline-none"
                                  autoFocus
                                />
                                <button type="submit" className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text)]">
                                  <Check size={14} />
                                </button>
                              </form>
                            ) : (
                              <>
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
                                    setEditingSubject(s.id)
                                    setEditingName(s.name)
                                  }}
                                  className="p-1 text-[var(--text-tertiary)] opacity-100 transition-opacity hover:text-[var(--text)] md:opacity-0 md:group-hover:opacity-100"
                                  title={t('subjects.editName')}
                                >
                                  <Pencil size={14} />
                                </button>
                                {subjects.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSubjectToDelete(s)
                                    }}
                                    className="p-1 text-[var(--text-tertiary)] opacity-100 transition-opacity hover:text-red-500 md:opacity-0 md:group-hover:opacity-100"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingTodosFor(s.id)
                                  }}
                                  className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text)]"
                                  title={t('subjects.viewTasks')}
                                >
                                  <CheckSquare size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                        <div className="border-t border-[var(--border)] mx-1 my-1" />
                        {isAddingSubject ? (
                          <div className="px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-sm hover:bg-[var(--bg-secondary)]"
                              >
                                {newSubjectEmoji || '😀'}
                              </button>
                              <input
                                type="text"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                onKeyDown={(e) => {
                                  e.stopPropagation()
                                  if (e.key === 'Enter') handleAddSubject()
                                  if (e.key === 'Escape') { setIsAddingSubject(false); setNewSubject(''); setNewSubjectEmoji(null); setShowEmojiPicker(false) }
                                }}
                                placeholder="Nombre..."
                                className="flex-1 border-none bg-transparent text-[13px] text-[var(--text)] outline-none ring-0 focus:border-none focus:outline-none focus:ring-0 placeholder:text-[var(--text-tertiary)]"
                                autoFocus
                              />
                              <button onClick={() => { setIsAddingSubject(false); setNewSubject(''); setNewSubjectEmoji(null); setShowEmojiPicker(false) }}>
                                <X size={14} className="text-[var(--text-tertiary)]" />
                              </button>
                            </div>
                            {showEmojiPicker && (
                              <div className="mt-2 grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                                {EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => { setNewSubjectEmoji(emoji); setShowEmojiPicker(false) }}
                                    className={`flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-[var(--bg-secondary)] ${newSubjectEmoji === emoji ? 'bg-[var(--bg-secondary)]' : ''}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingSubject(true)}
                            className="flex w-full items-center gap-2 rounded-md mx-1 px-2 py-1.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                            style={{ width: 'calc(100% - 8px)' }}
                          >
                            <Plus size={14} />
                            {t('subjects.newSubject')}
                          </button>
                        )}
                      </div>
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
                  {t('timer.break')}
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button
              id="main-timer"
              onClick={handleToggle}
              className="select-none font-semibold leading-none tracking-[-0.02em] tabular-nums outline-none"
              animate={{
                fontSize: isFocusMode
                  ? 'min(200px, 28vw)'
                  : isBreakMode
                    ? 'min(100px, 18vw)'
                    : 'min(140px, 22vw)'
              }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              aria-label={`${timer.isRunning ? t('timer.pauseTimer') : t('timer.startTimer')}. ${formatTime(timer.displayTime)}`}
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
                  aria-label={t('timer.skipBreak')}
                >
                  {t('timer.skipBreak')}
                </motion.button>
              )}
            </AnimatePresence>

          </div>

          
          {/* Controls */}
          <motion.div
            className="mt-6 flex items-center gap-4 sm:mt-10"
            animate={{
              opacity: (isFocusMode || isBreakMode) ? 0 : 1,
              height: (isFocusMode || isBreakMode) ? 0 : 'auto',
              marginTop: (isFocusMode || isBreakMode) ? 0 : undefined
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
              aria-label={t('timer.resetTimer')}
            >
              <RotateCcw size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleToggle}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)]"
              aria-label={timer.isRunning ? t('timer.pauseTimer') : t('timer.startTimer')}
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
              aria-label={t('timer.saveSession')}
              aria-disabled={!canSave}
            >
              <Check size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <motion.footer
        className="flex flex-shrink-0 items-center justify-center gap-2 px-4 py-3 text-[11px] tabular-nums text-[var(--text-tertiary)] sm:gap-4 sm:px-6 sm:py-5 sm:text-[12px]"
        style={{ paddingBottom: 'max(12px, var(--safe-area-bottom))' }}
        aria-label="Resumen de progreso"
        animate={{
          opacity: isDeepFocus ? 0 : 1,
          pointerEvents: isDeepFocus ? 'none' : 'auto'
        }}
        transition={{ duration: 0.4 }}
      >
        <span aria-label={`${t('stats.streak')}: ${stats.streak} ${t('common.days')}`}>{stats.streak} {t('common.days')}</span>
        <span className="text-[var(--border)]">·</span>
        {/* Daily progress */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-1 w-10 rounded-full bg-[var(--border)] sm:w-12"
            role="progressbar"
            aria-valuenow={Math.round(dayProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('stats.studyTimeToday')}
          >
            <motion.div
              className="h-full rounded-full bg-[var(--text-tertiary)]"
              animate={{ width: `${dayProgress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="hidden sm:inline">{t('common.today')}</span>
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
            aria-label={t('stats.weeklyProgress')}
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
        <CalendarPanel isOpen={showCalendar} onClose={() => setShowCalendar(false)} subjects={subjects} />
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
                {t('subjects.title')}
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
                      <span className={`h-2 w-2 rounded-full ${s.id === currentSubject ? 'bg-[var(--bg)]' : 'bg-[var(--text-tertiary)]'}`} />
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
                {t('todos.title')}
              </motion.p>
              {current?.todos?.filter(task => !task.completed).length > 0 ? (
                <div className="space-y-0.5">
                  {current.todos.filter(task => !task.completed).slice(0, 5).map((todo, index) => (
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
                  {current.todos.filter(task => !task.completed).length > 5 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="px-2.5 pt-1 text-[11px] text-[var(--text-tertiary)]"
                    >
                      {t('todos.more', { count: current.todos.filter(todo => !todo.completed).length - 5 })}
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
                  {t('todos.noPending')}
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

      {/* Delete subject confirmation modal */}
      <AnimatePresence>
        {subjectToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSubjectToDelete(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[var(--bg-solid)] p-6 shadow-2xl"
            >
              <h3 className="text-[15px] font-semibold text-[var(--text)]">
                {t('subjects.deleteConfirm.title')}
              </h3>
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                {t('subjects.deleteConfirm.message', { emoji: subjectToDelete.emoji, name: subjectToDelete.name })}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSubjectToDelete(null)}
                  className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    deleteSubject(subjectToDelete.id)
                    setSubjectToDelete(null)
                    setShowSubjects(false)
                  }}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-red-600"
                >
                  {t('common.delete')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [hasVisited, setHasVisited] = useLocalStorage('denso-visited', false)

  const handleEnterApp = () => {
    setHasVisited(true)
    navigate('/app')
  }

  // Redirect first-time visitors to landing (unless already on /landing or /privacy)
  useEffect(() => {
    if (!hasVisited && location.pathname !== '/landing' && location.pathname !== '/' && location.pathname !== '/privacy') {
      navigate('/landing')
    }
  }, [hasVisited, location.pathname, navigate])

  return (
    <Routes>
      <Route path="/landing" element={<Landing onEnterApp={handleEnterApp} />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/app" element={<TimerApp />} />
      <Route
        path="/"
        element={hasVisited ? <TimerApp /> : <Landing onEnterApp={handleEnterApp} />}
      />
    </Routes>
  )
}

export default App
