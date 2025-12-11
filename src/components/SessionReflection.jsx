import { motion } from 'framer-motion'

const FLOW_LEVELS = [
  { id: 'difficult', emoji: '😤', label: 'Difícil', value: 1 },
  { id: 'normal', emoji: '😐', label: 'Normal', value: 2 },
  { id: 'flow', emoji: '🔥', label: 'Flow', value: 3 },
]

export function SessionReflection({ onSelect, duration, energyLevel }) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    return `${mins} min`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]"
    >
      <div className="flex flex-col items-center px-6 text-center">
        {/* Celebration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="mb-6 text-5xl"
        >
          ✨
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[18px] font-semibold text-[var(--text)]"
        >
          {formatDuration(duration)} completados
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-[14px] text-[var(--text-secondary)]"
        >
          ¿Cómo fue la sesión?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex gap-3"
        >
          {FLOW_LEVELS.map((level, index) => (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(level)}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-[var(--bg-secondary)] px-5 py-4 transition-colors hover:bg-[var(--border)]"
            >
              <span className="text-3xl">{level.emoji}</span>
              <span className="text-[12px] font-medium text-[var(--text)]">{level.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Energy context */}
        {energyLevel && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-[11px] text-[var(--text-tertiary)]"
          >
            Energía inicial: {energyLevel.emoji} {energyLevel.label}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

export { FLOW_LEVELS }
