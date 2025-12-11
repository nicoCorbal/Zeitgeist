import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'
import { DURATIONS, EASINGS } from '../utils/animations'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

/**
 * Banner that shows when the app is offline
 * Also shows a brief "back online" message when connectivity is restored
 */
export function OfflineBanner() {
  const { isOffline, wasOffline } = useOnlineStatus()

  return (
    <AnimatePresence>
      {(isOffline || wasOffline) && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: DURATIONS.fast, ease: EASINGS.smooth }}
          className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center"
          style={{ paddingTop: 'max(8px, var(--safe-area-top))' }}
        >
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium shadow-lg ${
              isOffline
                ? 'bg-yellow-500/90 text-yellow-950'
                : 'bg-green-500/90 text-green-950'
            }`}
            role="alert"
            aria-live="polite"
          >
            {isOffline ? (
              <>
                <WifiOff size={14} aria-hidden="true" />
                <span>Sin conexión - Los datos se guardan localmente</span>
              </>
            ) : (
              <>
                <Wifi size={14} aria-hidden="true" />
                <span>Conexión restaurada</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
