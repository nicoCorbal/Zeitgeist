import { motion, AnimatePresence } from 'framer-motion'

function Digit({ value }) {
  return (
    <span className="relative inline-flex h-[1em] w-[0.6em] items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.23, 1, 0.32, 1]
          }}
          className="absolute"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function AnimatedDigits({ time, className }) {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  const m1 = Math.floor(minutes / 10)
  const m2 = minutes % 10
  const s1 = Math.floor(seconds / 10)
  const s2 = seconds % 10

  return (
    <span className={className}>
      <Digit value={m1} />
      <Digit value={m2} />
      <span className="inline-block w-[0.3em] text-center">:</span>
      <Digit value={s1} />
      <Digit value={s2} />
    </span>
  )
}
