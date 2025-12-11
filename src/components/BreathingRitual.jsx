import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BREATH_DURATION = 4000 // 4 seconds per breath phase
const TOTAL_BREATHS = 3

export function BreathingRitual({ onComplete, intention }) {
  const [phase, setPhase] = useState('inhale') // inhale, exhale
  const [breathCount, setBreathCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (isComplete) return

    const timer = setTimeout(() => {
      if (phase === 'inhale') {
        setPhase('exhale')
      } else {
        const newCount = breathCount + 1
        if (newCount >= TOTAL_BREATHS) {
          setIsComplete(true)
          setTimeout(onComplete, 500)
        } else {
          setBreathCount(newCount)
          setPhase('inhale')
        }
      }
    }, BREATH_DURATION)

    return () => clearTimeout(timer)
  }, [phase, breathCount, isComplete, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]"
    >
      <div className="flex flex-col items-center">
        {/* Intention */}
        {intention && (
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 max-w-xs text-center text-[15px] text-[var(--text-secondary)]"
          >
            "{intention}"
          </motion.p>
        )}

        {/* Breathing circle */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="rounded-full bg-[var(--text)]"
            animate={{
              width: phase === 'inhale' ? 180 : 80,
              height: phase === 'inhale' ? 180 : 80,
              opacity: phase === 'inhale' ? 0.15 : 0.08,
            }}
            transition={{
              duration: BREATH_DURATION / 1000,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute rounded-full border-2 border-[var(--text)]"
            animate={{
              width: phase === 'inhale' ? 180 : 80,
              height: phase === 'inhale' ? 180 : 80,
              opacity: phase === 'inhale' ? 0.6 : 0.3,
            }}
            transition={{
              duration: BREATH_DURATION / 1000,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Instructions */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-10 text-[14px] font-medium tracking-wide text-[var(--text-tertiary)]"
          >
            {phase === 'inhale' ? 'Inhala' : 'Exhala'}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="mt-6 flex gap-2">
          {Array.from({ length: TOTAL_BREATHS }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              animate={{
                backgroundColor: i < breathCount || (i === breathCount && phase === 'exhale')
                  ? 'var(--text)'
                  : 'var(--border)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Skip */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onComplete}
          className="mt-10 text-[12px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
        >
          Saltar
        </motion.button>
      </div>
    </motion.div>
  )
}
