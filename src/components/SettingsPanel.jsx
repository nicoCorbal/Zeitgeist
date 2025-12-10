import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Volume2, VolumeX, Clock, Palette } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { EmojiPicker } from './EmojiPicker'
import { IconPicker } from './IconPicker'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  }
}

export function SettingsPanel({
  isOpen,
  onClose,
  weeklyGoal,
  onWeeklyGoalChange,
  soundEnabled,
  onSoundToggle,
  currentSubject,
  onSubjectUpdate,
}) {
  const [goalHours, setGoalHours] = useState(Math.round(weeklyGoal / 3600))
  const [workMinutes, setWorkMinutes] = useState(Math.round((currentSubject?.workDuration || 25 * 60) / 60))
  const [breakMinutes, setBreakMinutes] = useState(Math.round((currentSubject?.breakDuration || 5 * 60) / 60))

  useEffect(() => {
    setGoalHours(Math.round(weeklyGoal / 3600))
  }, [weeklyGoal])

  useEffect(() => {
    setWorkMinutes(Math.round((currentSubject?.workDuration || 25 * 60) / 60))
    setBreakMinutes(Math.round((currentSubject?.breakDuration || 5 * 60) / 60))
  }, [currentSubject])

  const handleGoalChange = (hours) => {
    const h = Math.max(1, Math.min(80, hours))
    setGoalHours(h)
    onWeeklyGoalChange(h * 3600)
  }

  const handleWorkChange = (minutes) => {
    const m = Math.max(1, Math.min(120, minutes))
    setWorkMinutes(m)
  }

  const handleWorkCommit = () => {
    onSubjectUpdate({ workDuration: workMinutes * 60 })
  }

  const handleBreakChange = (minutes) => {
    const m = Math.max(1, Math.min(30, minutes))
    setBreakMinutes(m)
  }

  const handleBreakCommit = () => {
    onSubjectUpdate({ breakDuration: breakMinutes * 60 })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[var(--bg)] shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4"
            >
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
                Ajustes
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="rounded-full p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
              >
                <X size={18} />
              </motion.button>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Meta semanal */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Target size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Meta semanal
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={goalHours}
                        onChange={(e) => handleGoalChange(parseInt(e.target.value))}
                        className="h-1 flex-1"
                      />
                      <span className="w-12 text-right text-[15px] font-semibold tabular-nums text-[var(--text)]">
                        {goalHours}h
                      </span>
                    </div>
                    <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">
                      ~{Math.round(goalHours / 7 * 10) / 10}h por día
                    </p>
                  </div>
                </motion.div>

                {/* Sonido */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        Sonido
                      </span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onSoundToggle}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        soundEnabled ? 'bg-[var(--text)]' : 'bg-[var(--border)]'
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 h-4 w-4 rounded-full bg-[var(--bg)]"
                        animate={{ left: soundEnabled ? '24px' : '4px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
                    Notificación sonora al terminar
                  </p>
                </motion.div>

                {/* Personalización de asignatura */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Palette size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Personalizar · {currentSubject?.name || 'General'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)]">Emoji</span>
                      <div className="mt-2">
                        <EmojiPicker
                          value={currentSubject?.emoji}
                          onChange={(emoji) => onSubjectUpdate({ emoji })}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)]">Color</span>
                      <div className="mt-2">
                        <ColorPicker
                          value={currentSubject?.color}
                          onChange={(color) => onSubjectUpdate({ color })}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)]">Icono</span>
                      <div className="mt-2">
                        <IconPicker
                          value={currentSubject?.icon}
                          onChange={(icon) => onSubjectUpdate({ icon })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Pomodoro tiempos por asignatura */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Tiempos · {currentSubject?.name || 'General'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-[var(--text-secondary)]">Focus</span>
                        <span className="text-[13px] font-medium tabular-nums text-[var(--text)]">{workMinutes} min</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="120"
                        value={workMinutes}
                        onChange={(e) => handleWorkChange(parseInt(e.target.value))}
                        onMouseUp={handleWorkCommit}
                        onTouchEnd={handleWorkCommit}
                        className="h-1 w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-[var(--text-secondary)]">Descanso</span>
                        <span className="text-[13px] font-medium tabular-nums text-[var(--text)]">{breakMinutes} min</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={breakMinutes}
                        onChange={(e) => handleBreakChange(parseInt(e.target.value))}
                        onMouseUp={handleBreakCommit}
                        onTouchEnd={handleBreakCommit}
                        className="h-1 w-full"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Keyboard shortcuts */}
                <motion.div variants={itemVariants}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Atajos
                  </span>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--text-secondary)]">Play / Pausa</span>
                      <kbd className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                        espacio
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--text-secondary)]">Reiniciar</span>
                      <kbd className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                        R
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--text-secondary)]">Saltar break</span>
                      <kbd className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                        S
                      </kbd>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-[var(--border)] px-6 py-4"
            >
              <p className="text-center text-[11px] text-[var(--text-tertiary)]">
                Zeitgeist v1.0
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
