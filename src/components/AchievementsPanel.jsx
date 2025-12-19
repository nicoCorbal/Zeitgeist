import { useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Rocket, Zap, Star, Trophy, Crown, Flame, Clock, Sun, Moon, Calendar, Target, Book } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: DURATIONS.instant,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATIONS.fast, ease: EASINGS.smooth },
  },
}

function AchievementCard({ achievement }) {
  const { t } = useTranslation()
  const Icon = ICONS[achievement.icon] || Star
  const isUnlocked = achievement.unlocked

  return (
    <motion.div
      variants={itemVariants}
      className={`relative flex flex-col items-center rounded-lg border p-4 text-center transition-colors ${
        isUnlocked
          ? 'border-[var(--text)]/20 bg-[var(--bg-secondary)]'
          : 'border-[var(--border)] bg-[var(--bg)]'
      }`}
    >
      {/* Icon */}
      <div
        className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
          isUnlocked ? 'bg-[var(--text)]' : 'bg-[var(--bg-secondary)]'
        }`}
      >
        {isUnlocked ? (
          <Icon size={24} className="text-[var(--bg)]" aria-hidden="true" />
        ) : (
          <Lock size={20} className="text-[var(--text-tertiary)]" aria-hidden="true" />
        )}
      </div>

      {/* Name */}
      <h3
        className={`text-[13px] font-semibold ${
          isUnlocked ? 'text-[var(--text)]' : 'text-[var(--text-tertiary)]'
        }`}
      >
        {t(`achievements.${achievement.id}.name`)}
      </h3>

      {/* Description */}
      <p
        className={`mt-1 text-[11px] ${
          isUnlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'
        }`}
      >
        {t(`achievements.${achievement.id}.description`)}
      </p>

      {/* Unlocked indicator */}
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--text)]"
        >
          <Star size={10} className="fill-[var(--bg)] text-[var(--bg)]" />
        </motion.div>
      )}
    </motion.div>
  )
}

export function AchievementsPanel({ isOpen, onClose, achievements = [] }) {
  const { t } = useTranslation()
  const titleId = useId()
  const panelRef = useFocusTrap(isOpen, onClose)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATIONS.fast }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: DURATIONS.normal, ease: EASINGS.smooth }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-y-auto bg-[var(--bg-solid)] p-6 shadow-xl"
            style={{
              paddingTop: 'max(24px, var(--safe-area-top))',
              paddingBottom: 'max(24px, var(--safe-area-bottom))',
            }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-[var(--text)]">
                  {t('stats.achievements')}
                </h2>
                <p className="text-[13px] text-[var(--text-tertiary)]">
                  {unlockedCount} / {totalCount} {t('stats.unlocked')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                aria-label={t('common.close')}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]"
                role="progressbar"
                aria-valuenow={unlockedCount}
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-label={t('stats.achievementProgress')}
              >
                <motion.div
                  className="h-full rounded-full bg-[var(--text)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  transition={{ duration: DURATIONS.slow, ease: EASINGS.smooth, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Achievements grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3"
            >
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
