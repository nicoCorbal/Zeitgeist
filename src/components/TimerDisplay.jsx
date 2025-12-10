import { motion } from 'framer-motion'
import { formatTime } from '../utils/time'

export function TimerDisplay({ time, progress, isRunning, phase }) {
  return (
    <div className="flex flex-col items-center">
      {/* Phase label - fuera del timer para no afectar centrado */}
      <div className="h-6 mb-6">
        {phase && (
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {phase === 'work' ? 'Focus' : 'Break'}
          </span>
        )}
      </div>

      {/* Timer number - simple y centrado */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span
          className="block font-semibold tabular-nums tracking-[-0.02em] text-[var(--text)]"
          style={{ fontSize: '80px', lineHeight: 1 }}
        >
          {formatTime(time)}
        </span>

        {/* Progress bar debajo del número */}
        {progress !== null && (
          <div className="mt-6 h-px w-full bg-[var(--border)]">
            <motion.div
              className="h-full bg-[var(--text)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}
      </motion.div>

      {/* Running indicator */}
      <div className="h-8 mt-4 flex items-center">
        {isRunning && (
          <motion.div
            className="h-1 w-1 rounded-full bg-[var(--text)]"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  )
}
