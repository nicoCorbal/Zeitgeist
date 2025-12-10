import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Check } from 'lucide-react'

export function SubjectSelector({
  subjects,
  currentSubject,
  onSubjectChange,
  onAddSubject,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')

  const current = subjects.find((s) => s.id === currentSubject)

  const handleAdd = () => {
    if (newSubjectName.trim()) {
      onAddSubject(newSubjectName.trim())
      setNewSubjectName('')
      setIsAdding(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: current?.color }}
        />
        {current?.name || 'Seleccionar'}
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 top-full z-20 mt-3 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-light)] shadow-lg"
            >
              <div className="py-1">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      onSubjectChange(subject.id)
                      setIsOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-light)]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span
                        className={
                          subject.id === currentSubject
                            ? 'font-medium text-[var(--text)]'
                            : 'text-[var(--text-secondary)]'
                        }
                      >
                        {subject.name}
                      </span>
                    </div>
                    {subject.id === currentSubject && (
                      <Check size={14} strokeWidth={1.5} className="text-[var(--text)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-[var(--border)] py-1">
                {isAdding ? (
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd()
                        if (e.key === 'Escape') {
                          setIsAdding(false)
                          setNewSubjectName('')
                        }
                      }}
                      placeholder="Nombre..."
                      className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--text-muted)]"
                      autoFocus
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!newSubjectName.trim()}
                      className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)] disabled:opacity-30"
                    >
                      <Check size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-light)] hover:text-[var(--text)]"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                    Nueva materia
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
