import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

export function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-3 py-2"
    >
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
          todo.completed
            ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
            : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
        }`}
      >
        {todo.completed && <Check size={12} strokeWidth={3} />}
      </button>

      <span
        className={`flex-1 text-[14px] transition-colors ${
          todo.completed
            ? 'text-[var(--text-tertiary)] line-through'
            : 'text-[var(--text)]'
        }`}
      >
        {todo.text}
      </span>

      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        className="p-1 text-[var(--text-tertiary)] opacity-0 transition-opacity hover:text-[var(--text)] group-hover:opacity-100"
      >
        <X size={14} />
      </motion.button>
    </motion.div>
  )
}
