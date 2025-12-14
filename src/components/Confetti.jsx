import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DURATIONS, EASINGS } from '../utils/animations'

/**
 * Subtle confetti/particle celebration animation
 * Inspired by Apple's tasteful celebrations - minimal, elegant
 */

// Generate random particles with pre-computed animation values
const generateParticles = (count = 12) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // Start position (%)
    delay: Math.random() * DURATIONS.normal,
    duration: DURATIONS.slower + Math.random() * 0.4,
    size: 4 + Math.random() * 4,
    rotation: Math.random() * 360,
    // Pre-generate animation values to avoid Math.random() in render
    yOffset1: Math.random() * 40,
    yOffset2: Math.random() * 60,
    xOffset: (Math.random() - 0.5) * 100,
  }))
}

function Particle({ particle, color }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${particle.x}%`,
        top: '50%',
        width: particle.size,
        height: particle.size,
        backgroundColor: color,
      }}
      initial={{
        opacity: 0,
        y: 0,
        scale: 0,
        rotate: 0,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -60 - particle.yOffset1, -100 - particle.yOffset2],
        x: [particle.xOffset],
        scale: [0, 1, 0.8, 0],
        rotate: particle.rotation,
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        ease: EASINGS.smooth,
      }}
    />
  )
}

export function Confetti({
  isActive,
  onComplete,
  color = 'var(--text)',
  particleCount = 12,
}) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isActive) {
      setParticles(generateParticles(particleCount))

      // Call onComplete after animation
      const timer = setTimeout(() => {
        onComplete?.()
      }, 1200)

      return () => clearTimeout(timer)
    } else {
      setParticles([])
    }
  }, [isActive, particleCount, onComplete])

  return (
    <AnimatePresence>
      {isActive && particles.length > 0 && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {particles.map((particle) => (
            <Particle key={particle.id} particle={particle} color={color} />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Pulse ring animation - shows around timer during focus mode
 */
export function PulseRing({ isActive, size = 200 }) {
  if (!isActive) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <motion.div
        className="absolute rounded-full border border-[var(--text)]"
        style={{ width: size, height: size }}
        initial={{ opacity: 0.3, scale: 1 }}
        animate={{
          opacity: [0.3, 0.1, 0.3],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute rounded-full border border-[var(--text)]"
        style={{ width: size, height: size }}
        initial={{ opacity: 0.2, scale: 1 }}
        animate={{
          opacity: [0.2, 0.05, 0.2],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 3,
          delay: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

/**
 * Success checkmark animation
 */
export function SuccessCheck({ isVisible, onComplete }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATIONS.normal }}
          onAnimationComplete={() => {
            setTimeout(() => onComplete?.(), 800)
          }}
        >
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--text)]"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: DURATIONS.slow, ease: EASINGS.smooth }}
          >
            <motion.svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--bg)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M20 6L9 17L4 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: DURATIONS.normal, delay: 0.2 }}
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

