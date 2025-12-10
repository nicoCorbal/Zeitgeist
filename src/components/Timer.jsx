import { motion } from 'framer-motion'
import { TimerDisplay } from './TimerDisplay'
import { TimerControls } from './TimerControls'
import { ModeToggle } from './ModeToggle'
import { SubjectSelector } from './SubjectSelector'

export function Timer({
  timer,
  subjects,
  currentSubject,
  onSubjectChange,
  onAddSubject,
  onSaveSession,
}) {
  const handleSaveSession = () => {
    if (timer.mode === 'free' && timer.elapsedTime > 60) {
      onSaveSession()
    }
  }

  const current = subjects.find((s) => s.id === currentSubject)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-8"
    >
      <ModeToggle mode={timer.mode} onModeChange={timer.switchMode} />

      {/* Subject name grande */}
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--text)]">
          {current?.name || 'General'}
        </h2>
        <SubjectSelector
          subjects={subjects}
          currentSubject={currentSubject}
          onSubjectChange={onSubjectChange}
          onAddSubject={onAddSubject}
        />
      </div>

      <TimerDisplay
        time={timer.displayTime}
        progress={timer.progress}
        isRunning={timer.isRunning}
        phase={timer.mode === 'pomodoro' ? timer.phase : null}
      />

      <TimerControls
        isRunning={timer.isRunning}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={timer.reset}
      />

      {timer.mode === 'free' && timer.elapsedTime > 60 && !timer.isRunning && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSaveSession}
          className="text-[13px] font-medium text-[var(--text-muted)] underline underline-offset-4 transition-colors hover:text-[var(--text)]"
        >
          Guardar sesión
        </motion.button>
      )}

      {timer.mode === 'pomodoro' && timer.pomodoroCount > 0 && (
        <p className="text-[12px] tracking-wide text-[var(--text-muted)]">
          {timer.pomodoroCount} pomodoro{timer.pomodoroCount > 1 ? 's' : ''} completado{timer.pomodoroCount > 1 ? 's' : ''}
        </p>
      )}
    </motion.div>
  )
}
