import { Flame } from 'lucide-react'

export function StreakCounter({ streak }) {
  return (
    <div className="flex items-center gap-2">
      <Flame
        size={16}
        strokeWidth={1.5}
        className={streak > 0 ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}
      />
      <span className="text-[13px] font-medium text-[var(--text)]">
        {streak} {streak === 1 ? 'día' : 'días'}
      </span>
    </div>
  )
}
