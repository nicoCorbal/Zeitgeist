/**
 * Sound definitions with proper ADSR envelope parameters
 * Each sound has attack, decay, sustain, release for natural sound
 */
export const SOUNDS = [
  {
    id: 'bell',
    frequency: 830,
    type: 'sine',
    harmonics: [1, 0.5, 0.25], // Overtones for richer sound
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.4 },
  },
  {
    id: 'ding',
    frequency: 1200,
    type: 'sine',
    harmonics: [1, 0.3],
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.2 },
  },
  {
    id: 'chime',
    frequency: 660,
    type: 'triangle',
    harmonics: [1, 0.6, 0.3, 0.15],
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.4, release: 0.5 },
  },
  {
    id: 'soft',
    frequency: 440,
    type: 'sine',
    harmonics: [1, 0.2],
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.4 },
  },
  {
    id: 'ping',
    frequency: 1000,
    type: 'sine', // Changed from square for less harsh sound
    harmonics: [1],
    envelope: { attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.1 },
  },
  {
    id: 'gentle',
    frequency: 528, // "Healing" frequency
    type: 'sine',
    harmonics: [1, 0.4, 0.2],
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.6 },
  },
]

// Singleton AudioContext to avoid creating multiple contexts
let audioContext = null
let masterGain = null

/**
 * Initialize or get the audio context
 * Must be called after user interaction (browser policy)
 */
function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      masterGain = audioContext.createGain()
      masterGain.connect(audioContext.destination)
      masterGain.gain.value = 0.5 // Master volume
    } catch (e) {
      console.warn('[Sound] Failed to create AudioContext:', e)
      return null
    }
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }

  return audioContext
}

/**
 * Set master volume (0 to 1)
 */
export function setVolume(volume) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume))
  }
}

/**
 * Play a sound with proper ADSR envelope
 * @param {string} soundId - ID of the sound to play
 * @param {number} volume - Optional volume override (0 to 1)
 */
export function playSound(soundId, volume = 0.5) {
  const sound = SOUNDS.find(s => s.id === soundId)
  if (!sound) return

  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const { envelope, harmonics } = sound
    const totalDuration = envelope.attack + envelope.decay + envelope.sustain + envelope.release

    // Create oscillators for each harmonic (richer sound)
    harmonics.forEach((harmonicGain, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(masterGain)

      // Set frequency (fundamental + overtones)
      osc.frequency.value = sound.frequency * (index + 1)
      osc.type = sound.type

      // ADSR Envelope
      const peakGain = volume * harmonicGain
      const sustainGain = peakGain * 0.7

      // Attack
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(peakGain, now + envelope.attack)

      // Decay to sustain
      gain.gain.linearRampToValueAtTime(sustainGain, now + envelope.attack + envelope.decay)

      // Sustain (hold)
      gain.gain.setValueAtTime(sustainGain, now + envelope.attack + envelope.decay + envelope.sustain)

      // Release
      gain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration)

      // Start and stop
      osc.start(now)
      osc.stop(now + totalDuration + 0.1)
    })
  } catch (e) {
    console.warn('[Sound] Could not play sound:', e)
  }
}

/**
 * Play success sound (two-tone celebration)
 */
export function playSuccessSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // First note
    playNote(ctx, 523.25, now, 0.15) // C5
    // Second note (higher, slight delay)
    playNote(ctx, 659.25, now + 0.15, 0.2) // E5
  } catch (e) {
    console.warn('[Sound] Could not play success sound:', e)
  }
}

/**
 * Play a simple note
 */
function playNote(ctx, frequency, startTime, duration) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(masterGain)

  osc.frequency.value = frequency
  osc.type = 'sine'

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.1)
}

/**
 * Play break complete sound (descending, relaxing)
 */
export function playBreakSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // Descending notes for "time to work"
    playNote(ctx, 659.25, now, 0.15) // E5
    playNote(ctx, 523.25, now + 0.15, 0.2) // C5
  } catch (e) {
    console.warn('[Sound] Could not play break sound:', e)
  }
}

/**
 * Preview a sound (for settings)
 */
export function previewSound(soundId) {
  playSound(soundId, 0.4)
}

/**
 * Cleanup audio context (call on unmount if needed)
 */
export function cleanupAudio() {
  if (audioContext) {
    audioContext.close().catch(() => {})
    audioContext = null
    masterGain = null
  }
}
