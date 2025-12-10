import { motion } from 'framer-motion'
import { EMOJIS } from '../data/emojis'

export function EmojiPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(value === emoji ? null : emoji)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
            value === emoji
              ? 'bg-[var(--text)] text-[var(--bg)]'
              : 'hover:bg-[var(--bg-secondary)]'
          }`}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  )
}
