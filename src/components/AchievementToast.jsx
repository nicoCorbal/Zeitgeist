import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket,
  Zap,
  Star,
  Trophy,
  Crown,
  Flame,
  Clock,
  Sun,
  Moon,
  Calendar,
  Target,
  Book,
} from 'lucide-react'
import { DURATIONS, EASINGS } from '../utils/animations'

const ICONS = {
  rocket: Rocket,
  zap: Zap,
  star: Star,
  trophy: Trophy,
  crown: Crown,
  flame: Flame,
  clock: Clock,
  sun: Sun,
  moon: Moon,
  calendar: Calendar,
  target: Target,
  book: Book,
}

export function AchievementToast({ achievement, isVisible, onComplete }) {
  if (!achievement) return null

  const Icon = ICONS[achievement.icon] || Star

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: DURATIONS.normal, ease: EASINGS.smooth }}
          onAnimationComplete={() => {
            // Auto-dismiss after 3 seconds
            setTimeout(() => onComplete?.(), 3000)
          }}
          className="fixed left-1/2 top-8 z-50 -translate-x-1/2"
          style={{ paddingTop: 'max(0px, var(--safe-area-top))' }}
          role="alert"
          aria-live="polite"
        >
          <motion.div
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 shadow-lg"
            initial={{ boxShadow: '0 0 0 0 rgba(var(--text-rgb), 0.3)' }}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(var(--text-rgb), 0.3)',
                '0 0 0 8px rgba(var(--text-rgb), 0)',
                '0 0 0 0 rgba(var(--text-rgb), 0)',
              ],
            }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Icon with glow */}
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text)]"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 200,
                delay: 0.1,
              }}
            >
              <Icon size={20} className="text-[var(--bg)]" aria-hidden="true" />
            </motion.div>

            {/* Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]"
              >
                Logro desbloqueado
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[14px] font-semibold text-[var(--text)]"
              >
                {achievement.name}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="text-[12px] text-[var(--text-secondary)]"
              >
                {achievement.description}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
