import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { SOUNDS, playSound } from '../data/sounds'

export function SoundPicker({ value, onChange }) {
  const handleSelect = (soundId) => {
    onChange(soundId)
    playSound(soundId)
  }

  return (
    <div className="space-y-1">
      {SOUNDS.map((sound) => (
        <motion.button
          key={sound.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect(sound.id)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
            value === sound.id
              ? 'bg-[var(--text)] text-[var(--bg)]'
              : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          }`}
        >
          <Volume2 size={14} />
          <span className="text-[13px]">{sound.name}</span>
        </motion.button>
      ))}
    </div>
  )
}
