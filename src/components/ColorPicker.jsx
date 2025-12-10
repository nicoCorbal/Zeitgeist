import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { COLORS } from '../data/colors'

export function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(color)}
          className="relative flex h-8 w-8 items-center justify-center rounded-full transition-shadow hover:shadow-md"
          style={{ backgroundColor: color }}
        >
          {value === color && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-white"
            >
              <Check size={14} strokeWidth={3} />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  )
}
