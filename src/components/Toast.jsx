import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'

export function Toast({ message, type = 'success', isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 shadow-lg">
            {type === 'success' ? (
              <Check size={14} className="text-[var(--text)]" />
            ) : (
              <AlertCircle size={14} className="text-[var(--text)]" />
            )}
            <span className="text-[13px] font-medium text-[var(--text)]">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
