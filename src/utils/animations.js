/**
 * Animation constants for consistent motion throughout the app
 * Inspired by Apple's Human Interface Guidelines
 */

// Duration constants (in seconds for Framer Motion)
export const DURATIONS = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
}

// Duration constants in milliseconds (for CSS transitions)
export const DURATIONS_MS = {
  instant: 100,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
}

// Easing curves
// Apple-style smooth easings
export const EASINGS = {
  // Standard ease-out for most animations
  smooth: [0.23, 1, 0.32, 1],
  // Quick start, smooth end
  snappy: [0.25, 0.1, 0.25, 1],
  // Gentle ease for subtle animations
  gentle: [0.4, 0, 0.2, 1],
  // Bounce effect for playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55],
  // Linear for progress bars
  linear: [0, 0, 1, 1],
}

// Spring configurations for Framer Motion
export const SPRINGS = {
  // Gentle, smooth spring
  gentle: {
    type: 'spring',
    damping: 30,
    stiffness: 300,
  },
  // Snappy, responsive spring
  snappy: {
    type: 'spring',
    damping: 25,
    stiffness: 400,
  },
  // Bouncy spring for celebrations
  bouncy: {
    type: 'spring',
    damping: 15,
    stiffness: 300,
  },
  // Very soft spring for background elements
  soft: {
    type: 'spring',
    damping: 40,
    stiffness: 200,
  },
}

// Common transition presets
export const TRANSITIONS = {
  // Default smooth transition
  default: {
    duration: DURATIONS.normal,
    ease: EASINGS.smooth,
  },
  // Fast micro-interaction
  micro: {
    duration: DURATIONS.fast,
    ease: EASINGS.snappy,
  },
  // Slow, dramatic transition
  dramatic: {
    duration: DURATIONS.slow,
    ease: EASINGS.smooth,
  },
  // Page/panel transitions
  page: {
    duration: DURATIONS.normal,
    ease: EASINGS.gentle,
  },
  // Fade in/out
  fade: {
    duration: DURATIONS.fast,
    ease: EASINGS.linear,
  },
}

// Common animation variants for Framer Motion
export const VARIANTS = {
  // Fade in from below
  fadeUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  // Fade in from above
  fadeDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  // Slide in from left
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  // Slide in from right
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  // Simple fade
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
}

// Stagger children animation
export const staggerContainer = (staggerChildren = 0.05) => ({
  animate: {
    transition: {
      staggerChildren,
    },
  },
})

// Delayed animation helper
export const withDelay = (delay, transition = TRANSITIONS.default) => ({
  ...transition,
  delay,
})
