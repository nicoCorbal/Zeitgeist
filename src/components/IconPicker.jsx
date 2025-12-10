import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { ICONS } from '../data/icons'

export function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {ICONS.map((iconName) => {
        const Icon = LucideIcons[iconName]
        if (!Icon) return null

        return (
          <motion.button
            key={iconName}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(value === iconName ? null : iconName)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              value === iconName
                ? 'bg-[var(--text)] text-[var(--bg)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]'
            }`}
          >
            <Icon size={18} />
          </motion.button>
        )
      })}
    </div>
  )
}
