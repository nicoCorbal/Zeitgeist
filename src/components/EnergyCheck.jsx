import { motion } from 'framer-motion'

const ENERGY_LEVELS = [
  { id: 'low', emoji: '😴', label: 'Bajo', suggestedMinutes: 15, color: '#94a3b8' },
  { id: 'normal', emoji: '😐', label: 'Normal', suggestedMinutes: 25, color: '#64748b' },
  { id: 'high', emoji: '⚡', label: 'Alto', suggestedMinutes: 45, color: '#f59e0b' },
]

export function EnergyCheck({ onSelect, onSkip }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]"
    >
      <div className="flex flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[15px] text-[var(--text-secondary)]"
        >
          ¿Cómo está tu energía?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex gap-4"
        >
          {ENERGY_LEVELS.map((level, index) => (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.01 + index * 0.01 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(level)}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-8 py-6 shadow-sm hover:border-[var(--text-tertiary)] hover:shadow-md"
              style={{ transition: 'border-color 0.15s, box-shadow 0.15s' }}
            >
              <span className="text-5xl">{level.emoji}</span>
              <div className="text-center">
                <span className="block text-[14px] font-medium text-[var(--text)]">{level.label}</span>
                <span className="block text-[12px] text-[var(--text-tertiary)]">{level.suggestedMinutes} min</span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onSkip}
          className="mt-8 text-[13px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
        >
          Saltar
        </motion.button>
      </div>
    </motion.div>
  )
}

export { ENERGY_LEVELS }
