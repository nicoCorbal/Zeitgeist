import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, Info, X } from 'lucide-react'
import { DURATIONS, EASINGS } from '../utils/animations'

const ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
}

export function Toast({ message, type = 'success', isVisible, onDismiss }) {
  const Icon = ICONS[type] || Check

  // Determine aria-live politeness based on type
  // Error/warning are assertive (urgent), success/info are polite
  const ariaLive = type === 'error' || type === 'warning' ? 'assertive' : 'polite'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="alert"
          aria-live={ariaLive}
          aria-atomic="true"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: DURATIONS.fast, ease: EASINGS.smooth }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
          style={{ paddingBottom: 'max(0px, var(--safe-area-bottom))' }}
        >
          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-solid)] px-4 py-2 shadow-lg backdrop-blur-xl">
            <Icon
              size={14}
              className="flex-shrink-0 text-[var(--text)]"
              aria-hidden="true"
            />
            <span className="text-[13px] font-medium text-[var(--text)]">
              {message}
            </span>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-1 flex-shrink-0 rounded-full p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                aria-label="Cerrar notificación"
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
