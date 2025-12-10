import { motion } from 'framer-motion'
import { formatDuration } from '../utils/time'

export function WeeklyGoal({ current, goal }) {
  const progress = Math.min(current / goal, 1)

  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          className="h-full rounded-full bg-[var(--text)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[13px] tabular-nums text-[var(--text-muted)]">
        {formatDuration(current)}
        <span className="text-[var(--border)]"> / </span>
        {formatDuration(goal)}
      </span>
    </div>
  )
}
