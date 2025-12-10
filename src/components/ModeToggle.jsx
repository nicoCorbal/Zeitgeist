import { motion } from 'framer-motion'

export function ModeToggle({ mode, onModeChange }) {
  const modes = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'free', label: 'Libre' },
  ]

  return (
    <div className="inline-flex gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-light)] p-1">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className="relative px-5 py-2 text-[13px] font-medium tracking-[-0.01em] transition-colors"
        >
          {mode === m.id && (
            <motion.div
              layoutId="mode-indicator"
              className="absolute inset-0 rounded-full bg-[var(--bg)]"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ${
              mode === m.id ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {m.label}
          </span>
        </button>
      ))}
    </div>
  )
}
