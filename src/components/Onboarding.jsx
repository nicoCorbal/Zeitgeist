import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Target, BookOpen, ChevronRight, Check, Shield } from 'lucide-react'
import { DURATIONS, EASINGS } from '../utils/animations'

const STEPS = [
  {
    id: 'welcome',
    icon: Clock,
    title: 'Bienvenido a Denso',
    description: 'Tu compañero de estudio minimalista. Pomodoro o tiempo libre, tú decides.',
  },
  {
    id: 'data',
    icon: Shield,
    title: 'Tus datos son tuyos',
    description: 'Todo se guarda en tu dispositivo, no en la nube. Desde ajustes puedes descargar un archivo con tus datos y subirlo en otro dispositivo o navegador.',
    warning: 'Si borras los datos del navegador o cambias de dispositivo sin copia, perderás tu progreso.',
  },
  {
    id: 'goal',
    icon: Target,
    title: '¿Cuántas horas por semana?',
    description: 'Establece una meta realista. Puedes cambiarla cuando quieras.',
    hasInput: true,
    inputType: 'goal',
  },
  {
    id: 'subject',
    icon: BookOpen,
    title: 'Tu primera asignatura',
    description: 'Organiza tu tiempo por materias. Añade más después.',
    hasInput: true,
    inputType: 'subject',
  },
]

export function Onboarding({ onComplete, onGoalChange, onAddSubject }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [goalHours, setGoalHours] = useState(15)
  const [subjectName, setSubjectName] = useState('')
  const [subjectEmoji, setSubjectEmoji] = useState('📚')

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const Icon = step.icon

  const handleNext = () => {
    if (step.inputType === 'goal') {
      onGoalChange(goalHours * 3600)
    }

    if (step.inputType === 'subject' && subjectName.trim()) {
      onAddSubject(subjectName.trim(), subjectEmoji)
    }

    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const canProceed = () => {
    if (step.inputType === 'subject') {
      return subjectName.trim().length > 0
    }
    return true
  }

  const emojis = ['📚', '🧮', '🔬', '📝', '💻', '🎨', '🌍', '📖', '🧠', '✏️']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] p-6"
    >
      <div className="w-full max-w-sm">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? 'w-6 bg-[var(--text)]'
                  : i < currentStep
                    ? 'w-1.5 bg-[var(--text)]'
                    : 'w-1.5 bg-[var(--border)]'
              }`}
              initial={false}
              animate={{ width: i === currentStep ? 24 : 6 }}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: DURATIONS.normal, ease: EASINGS.smooth }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--text)]"
            >
              <Icon size={28} className="text-[var(--bg)]" />
            </motion.div>

            {/* Title */}
            <h1 className="mb-2 text-xl font-semibold text-[var(--text)]">
              {step.title}
            </h1>

            {/* Description */}
            <p className="text-[14px] text-[var(--text-secondary)]">
              {step.description}
            </p>

            {/* Warning */}
            {step.warning && (
              <p className="mt-3 text-[12px] text-amber-600 dark:text-amber-500">
                {step.warning}
              </p>
            )}

            <div className="mb-8" />

            {/* Goal input */}
            {step.inputType === 'goal' && (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setGoalHours(Math.max(1, goalHours - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition-colors hover:bg-[var(--bg-secondary)]"
                  >
                    -
                  </button>
                  <div className="w-24 text-center">
                    <span className="text-4xl font-bold text-[var(--text)]">{goalHours}</span>
                    <span className="ml-1 text-[var(--text-secondary)]">h</span>
                  </div>
                  <button
                    onClick={() => setGoalHours(Math.min(60, goalHours + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition-colors hover:bg-[var(--bg-secondary)]"
                  >
                    +
                  </button>
                </div>
                <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">
                  ~{Math.round(goalHours / 7 * 10) / 10}h por día
                </p>
              </div>
            )}

            {/* Subject input */}
            {step.inputType === 'subject' && (
              <div className="mb-8 space-y-4">
                {/* Emoji picker */}
                <div className="flex flex-wrap justify-center gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSubjectEmoji(emoji)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all ${
                        subjectEmoji === emoji
                          ? 'bg-[var(--text)] scale-110'
                          : 'bg-[var(--bg-secondary)] hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Name input */}
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Nombre de la asignatura"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center text-[15px] text-[var(--text)] outline-none transition-colors focus:border-[var(--text)]"
                  autoFocus
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-[15px] font-semibold transition-all ${
              canProceed()
                ? 'bg-[var(--text)] text-[var(--bg)]'
                : 'bg-[var(--border)] text-[var(--text-tertiary)] cursor-not-allowed'
            }`}
          >
            {isLastStep ? (
              <>
                Empezar
                <Check size={18} />
              </>
            ) : (
              <>
                Continuar
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>

          {currentStep === 0 && (
            <button
              onClick={onComplete}
              className="text-[13px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]"
            >
              Saltar tutorial
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
