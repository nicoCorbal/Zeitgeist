import { motion } from 'framer-motion'
import { THEME_LIST } from '../data/themes'

export function ThemePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {THEME_LIST.map((theme) => (
        <motion.button
          key={theme.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(theme.id)}
          className={`relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all ${
            value === theme.id
              ? 'ring-2 ring-[var(--text)] ring-offset-2 ring-offset-[var(--bg)]'
              : 'hover:bg-[var(--bg-secondary)]'
          }`}
        >
          {/* Preview de colores */}
          <div
            className="flex h-8 w-full items-center justify-center rounded-md border"
            style={{
              background: theme.colors.bgSpecial || theme.colors.bg,
              borderColor: theme.colors.border,
            }}
          >
            <span
              className="text-[11px] font-semibold tabular-nums"
              style={{ color: theme.colors.text }}
            >
              25:00
            </span>
          </div>
          <span className="text-[10px] font-medium text-[var(--text-secondary)]">
            {theme.name}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
