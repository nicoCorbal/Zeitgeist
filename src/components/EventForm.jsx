import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, GraduationCap, Heart } from 'lucide-react'

export function EventForm({
  isOpen,
  onClose,
  onSave,
  subjects = [],
  initialDate = null,
  editingEvent = null,
}) {
  const [type, setType] = useState('study-block')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [subjectId, setSubjectId] = useState('')
  const [useRange, setUseRange] = useState(false)

  // Reset form when opening or when editingEvent changes
  useEffect(() => {
    if (isOpen) {
      setType(editingEvent?.type || 'study-block')
      setTitle(editingEvent?.title || '')
      setDate(editingEvent?.date || initialDate || '')
      setEndDate(editingEvent?.date || initialDate || '')
      setTime(editingEvent?.time || '')
      setDuration(editingEvent?.duration || 60)
      setSubjectId(editingEvent?.subjectId || '')
      setUseRange(false)
    }
  }, [isOpen, editingEvent, initialDate])

  const getDaysBetween = (startStr, endStr) => {
    const start = new Date(startStr + 'T12:00:00')
    const end = new Date(endStr + 'T12:00:00')
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays) + 1
  }

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + days)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const totalDays = useRange && endDate >= date ? getDaysBetween(date, endDate) : 1

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !date) return

    // Si estamos editando, solo guardar uno
    if (editingEvent?.id) {
      onSave({
        id: editingEvent.id,
        type,
        title: title.trim(),
        date,
        time: time || null,
        duration: type === 'study-block' ? duration : null,
        subjectId: subjectId || null,
      })
    } else {
      // Crear eventos para el rango de fechas
      for (let i = 0; i < totalDays; i++) {
        onSave({
          type,
          title: title.trim(),
          date: addDays(date, i),
          time: time || null,
          duration: type === 'study-block' ? duration : null,
          subjectId: subjectId || null,
        })
      }
    }

    setUseRange(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          {/* Modal - fullscreen on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[var(--bg)] p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:inset-auto md:left-1/2 md:top-1/2 md:w-[calc(100%-2rem)] md:max-w-sm md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-6 md:pt-6 md:shadow-xl"
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[17px] font-semibold">
                {editingEvent ? 'Editar evento' : 'Nuevo evento'}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              >
                <X size={18} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo */}
              <div className="flex gap-1 rounded-xl bg-[var(--bg-secondary)] p-1">
                <button
                  type="button"
                  onClick={() => setType('study-block')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition-colors ${
                    type === 'study-block'
                      ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm'
                      : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  <BookOpen size={14} />
                  Estudio
                </button>
                <button
                  type="button"
                  onClick={() => setType('exam')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition-colors ${
                    type === 'exam'
                      ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm'
                      : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  <GraduationCap size={14} />
                  Examen
                </button>
                <button
                  type="button"
                  onClick={() => setType('personal')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition-colors ${
                    type === 'personal'
                      ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm'
                      : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  <Heart size={14} />
                  Personal
                </button>
              </div>

              {/* Título */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === 'exam'
                      ? 'Ej: Examen de Matemáticas'
                      : type === 'personal'
                        ? 'Ej: Ver a mi novia'
                        : 'Ej: Estudiar Tema 5'
                  }
                  className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-2.5 text-[14px] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text)]/20"
                  required
                />
              </div>

              {/* Fechas */}
              {!editingEvent && type === 'study-block' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseRange(false)}
                    className={`flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors ${
                      !useRange
                        ? 'bg-[var(--bg-secondary)] text-[var(--text)]'
                        : 'text-[var(--text-tertiary)]'
                    }`}
                  >
                    Un día
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseRange(true)}
                    className={`flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors ${
                      useRange
                        ? 'bg-[var(--bg-secondary)] text-[var(--text)]'
                        : 'text-[var(--text-tertiary)]'
                    }`}
                  >
                    Rango de fechas
                  </button>
                </div>
              )}

              <div className={useRange && !editingEvent && type === 'study-block' ? 'grid grid-cols-2 gap-3' : ''}>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                    {useRange && !editingEvent && type === 'study-block' ? 'Inicio' : 'Fecha'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      if (e.target.value > endDate) setEndDate(e.target.value)
                    }}
                    className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--text)]/20"
                    required
                  />
                </div>

                {useRange && !editingEvent && type === 'study-block' && (
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                      Fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={date}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--text)]/20"
                      required
                    />
                  </div>
                )}
              </div>

              {useRange && !editingEvent && type === 'study-block' && totalDays > 1 && (
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Se crearán {totalDays} eventos de estudio
                </p>
              )}

              {/* Hora (opcional) */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Hora <span className="text-[var(--text-tertiary)]">(opcional)</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--text)]/20"
                />
              </div>

              {/* Duración (solo bloques) */}
              {type === 'study-block' && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={15}
                    max={480}
                    step={15}
                    className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--text)]/20"
                  />
                </div>
              )}

              {/* Asignatura (opcional) */}
              {subjects.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                    Asignatura <span className="text-[var(--text-tertiary)]">(opcional)</span>
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--text)]/20"
                  >
                    <option value="">Sin asignatura</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botón guardar */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 w-full rounded-xl bg-[var(--text)] py-3 text-[14px] font-semibold text-[var(--bg)] transition-colors"
              >
                {editingEvent
                  ? 'Guardar cambios'
                  : totalDays > 1
                    ? `Añadir ${totalDays} eventos`
                    : 'Añadir evento'}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
