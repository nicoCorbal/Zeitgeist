import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Target, BookOpen, ChevronRight, Check, Shield, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DURATIONS, EASINGS } from '../utils/animations'
import { EMOJIS } from '../data/emojis'

const STEP_CONFIG = [
  { id: 'welcome', icon: Clock, key: 'welcome' },
  { id: 'data', icon: Shield, key: 'privacy', hasWarning: true },
  { id: 'calendar', icon: Calendar, key: 'exams' },
  { id: 'goal', icon: Target, key: 'goal', hasInput: true, inputType: 'goal' },
  { id: 'subject', icon: BookOpen, key: 'subject', hasInput: true, inputType: 'subject' },
]

export function Onboarding({ onComplete, onGoalChange, onAddSubject }) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [goalHours, setGoalHours] = useState(15)
  const [subjectName, setSubjectName] = useState('')
  const [subjectEmoji, setSubjectEmoji] = useState('📚')

  const stepConfig = STEP_CONFIG[currentStep]
  const isLastStep = currentStep === STEP_CONFIG.length - 1
  const Icon = stepConfig.icon

  const handleNext = () => {
    if (stepConfig.inputType === 'goal') {
      onGoalChange(goalHours * 3600)
    }

    if (stepConfig.inputType === 'subject' && subjectName.trim()) {
      onAddSubject(subjectName.trim(), subjectEmoji)
    }

    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const canProceed = () => {
    if (stepConfig.inputType === 'subject') {
      return subjectName.trim().length > 0
    }
    return true
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]"
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {STEP_CONFIG.map((_, i) => (
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
            key={stepConfig.id}
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
              {t(`onboarding.${stepConfig.key}.title`)}
            </h1>

            {/* Description */}
            <p className="text-[14px] text-[var(--text-secondary)]">
              {t(`onboarding.${stepConfig.key}.subtitle`)}
            </p>

            {/* Warning */}
            {stepConfig.hasWarning && (
              <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">
                ⚠️ {t(`onboarding.${stepConfig.key}.warning`)}
              </p>
            )}

            <div className="mb-8" />

            {/* Goal input */}
            {stepConfig.inputType === 'goal' && (
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
                  ~{Math.round(goalHours / 7 * 10) / 10}h/{t('common.days').charAt(0)}
                </p>
              </div>
            )}

            {/* Subject input */}
            {stepConfig.inputType === 'subject' && (
              <div className="mb-8 space-y-4">
                {/* Emoji picker */}
                <div className="max-h-32 overflow-y-auto rounded-lg bg-[var(--bg-secondary)] p-2">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSubjectEmoji(emoji)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                          subjectEmoji === emoji
                            ? 'bg-[var(--text)] scale-110'
                            : 'hover:bg-[var(--bg)] hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name input */}
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder={t('onboarding.subject.placeholder')}
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
                {t('common.start')}
                <Check size={18} />
              </>
            ) : (
              <>
                {t('common.continue')}
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>

          {currentStep === 0 && (
            <button
              onClick={onComplete}
              className="text-[13px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]"
            >
              {t('onboarding.skipTutorial')}
            </button>
          )}
        </div>
        </div>
      </div>
    </motion.div>
  )
}
