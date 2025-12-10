import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'

export function TimerControls({ isRunning, onStart, onPause, onReset }) {
  return (
    <div className="flex items-center justify-center gap-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)]"
        aria-label="Reset"
      >
        <RotateCcw size={18} strokeWidth={1.5} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={isRunning ? onPause : onStart}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--text)] text-[var(--text)] transition-all hover:bg-[var(--text)] hover:text-white"
        aria-label={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? (
          <Pause size={20} strokeWidth={1.5} />
        ) : (
          <Play size={20} strokeWidth={1.5} className="ml-0.5" />
        )}
      </motion.button>

      <div className="h-11 w-11" />
    </div>
  )
}
