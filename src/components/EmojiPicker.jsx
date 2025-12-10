import { motion } from 'framer-motion'
import { EMOJIS } from '../data/emojis'

export function EmojiPicker({ value, onChange }) {
  return (
    <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(value === emoji ? null : emoji)}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors ${
              value === emoji
                ? 'bg-[var(--text)] text-[var(--bg)]'
                : 'hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
