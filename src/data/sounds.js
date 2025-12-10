export const SOUNDS = [
  {
    id: 'bell',
    name: 'Campana',
    // Usamos Web Audio API para generar sonidos
    frequency: 830,
    type: 'sine',
    duration: 0.5,
  },
  {
    id: 'ding',
    name: 'Ding',
    frequency: 1200,
    type: 'sine',
    duration: 0.3,
  },
  {
    id: 'chime',
    name: 'Chime',
    frequency: 660,
    type: 'triangle',
    duration: 0.8,
  },
  {
    id: 'soft',
    name: 'Suave',
    frequency: 440,
    type: 'sine',
    duration: 0.6,
  },
  {
    id: 'ping',
    name: 'Ping',
    frequency: 1000,
    type: 'square',
    duration: 0.15,
  },
]

// Función para reproducir sonido usando Web Audio API
export function playSound(soundId) {
  const sound = SOUNDS.find(s => s.id === soundId)
  if (!sound) return

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = sound.frequency
    oscillator.type = sound.type

    // Envelope para que suene más natural
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + sound.duration)

    oscillator.start(now)
    oscillator.stop(now + sound.duration)
  } catch (e) {
    console.warn('Could not play sound:', e)
  }
}
