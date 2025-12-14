import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar, Trash2, Check, Pencil } from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useCalendar } from '../hooks/useCalendar'
import { CalendarGrid } from './CalendarGrid'
import { EventForm } from './EventForm'

export function CalendarPanel({ isOpen, onClose, subjects = [] }) {
  const titleId = useId()
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  // Handle ESC: close EventForm first, then CalendarPanel
  const handleClose = () => {
    if (showEventForm) {
      setShowEventForm(false)
      setEditingEvent(null)
    } else {
      onClose()
    }
  }

  const panelRef = useFocusTrap(isOpen, handleClose)

  const {
    addEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
    getEventsForDate,
    getEventsForMonth,
    upcomingExams,
  } = useCalendar()

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [activeTab, setActiveTab] = useState('selected') // 'selected' | 'upcoming'

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthEvents = getEventsForMonth(year, month)
  const selectedDateEvents = selectedDate
    ? getEventsForDate(selectedDate).sort((a, b) => {
        // Events without time come first, then sort by time
        if (!a.time && !b.time) return 0
        if (!a.time) return -1
        if (!b.time) return 1
        return a.time.localeCompare(b.time)
      })
    : []

  const handlePrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const handleSelectDate = (dateKey) => {
    setSelectedDate(dateKey === selectedDate ? null : dateKey)
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleSaveEvent = (eventData) => {
    if (eventData.id) {
      updateEvent(eventData.id, eventData)
    } else {
      addEvent(eventData)
    }
    setShowEventForm(false)
    setEditingEvent(null)
  }

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const getDaysUntil = (dateStr) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr + 'T00:00:00')
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const formatCountdown = (days) => {
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Mañana'
    if (days < 0) return 'Pasado'
    return `${days}d`
  }

  // Calculate progress: time elapsed / total time
  const getExamProgress = (createdAt, examDate) => {
    const created = new Date(createdAt)
    const exam = new Date(examDate + 'T00:00:00')
    const now = new Date()

    const totalTime = exam - created
    const elapsedTime = now - created

    if (totalTime <= 0) return 1
    return Math.min(1, Math.max(0, elapsedTime / totalTime))
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-500'
      case 'personal': return 'bg-pink-500'
      default: return 'bg-blue-500'
    }
  }

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'exam': return 'Examen'
      case 'personal': return 'Personal'
      default: return 'Estudio'
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            {/* Modal - fullscreen on mobile, centered on desktop */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-solid)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[90vh] md:w-[calc(100%-2rem)] md:max-w-3xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-0 md:pt-0 md:shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[var(--text-secondary)]" />
                  <h2
                    id={titleId}
                    className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]"
                  >
                    Calendario
                  </h2>
                </div>
                <button
                  data-close-button
                  onClick={onClose}
                  className="rounded-full p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                  aria-label="Cerrar calendario"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Left: Calendar Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CalendarGrid
                      year={year}
                      month={month}
                      events={monthEvents}
                      selectedDate={selectedDate}
                      onSelectDate={handleSelectDate}
                      onPrevMonth={handlePrevMonth}
                      onNextMonth={handleNextMonth}
                    />
                  </motion.div>

                  {/* Right: Events */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex flex-col"
                  >
                    {/* Tabs */}
                    <div className="mb-4 flex gap-1 rounded-lg bg-[var(--bg-secondary)] p-1">
                      <button
                        onClick={() => setActiveTab('selected')}
                        className={`flex-1 rounded-md py-2 text-[12px] font-medium transition-colors ${
                          activeTab === 'selected'
                            ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm'
                            : 'text-[var(--text-tertiary)]'
                        }`}
                      >
                        {selectedDate ? formatShortDate(selectedDate) : 'Día'}
                      </button>
                      <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 rounded-md py-2 text-[12px] font-medium transition-colors ${
                          activeTab === 'upcoming'
                            ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm'
                            : 'text-[var(--text-tertiary)]'
                        }`}
                      >
                        Exámenes
                        {upcomingExams.length > 0 && (
                          <span className="ml-1.5 text-[10px] text-[var(--text-tertiary)]">
                            {upcomingExams.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                      {activeTab === 'selected' ? (
                        <motion.div
                          key="selected"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {!selectedDate ? (
                            <p className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">
                              Selecciona un día en el calendario
                            </p>
                          ) : selectedDateEvents.length === 0 ? (
                            <p className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">
                              Sin eventos para este día
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {selectedDateEvents.map((event, index) => (
                                <motion.li
                                  key={event.id}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                >
                                  <EventItem
                                    event={event}
                                    subjects={subjects}
                                    onToggle={() => toggleComplete(event.id)}
                                    onEdit={() => handleEditEvent(event)}
                                    onDelete={() => deleteEvent(event.id)}
                                    getEventTypeColor={getEventTypeColor}
                                    getEventTypeLabel={getEventTypeLabel}
                                  />
                                </motion.li>
                              ))}
                            </ul>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="upcoming"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {upcomingExams.length === 0 ? (
                            <p className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">
                              No hay exámenes próximos
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {upcomingExams.map((exam, index) => {
                                const daysUntil = getDaysUntil(exam.date)
                                const subject = subjects.find((s) => s.id === exam.subjectId)

                                return (
                                  <motion.li
                                    key={exam.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <button
                                      onClick={() => {
                                        const [y, m] = exam.date.split('-').map(Number)
                                        setCurrentDate(new Date(y, m - 1, 1))
                                        setSelectedDate(exam.date)
                                        setActiveTab('selected')
                                      }}
                                      className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] p-3 text-left transition-colors hover:border-[var(--text-tertiary)]"
                                    >
                                      <ProgressRing
                                        progress={getExamProgress(exam.createdAt, exam.date)}
                                        daysUntil={daysUntil}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="truncate text-[13px] font-medium text-[var(--text)]">
                                          {subject?.emoji && `${subject.emoji} `}
                                          {exam.title}
                                        </p>
                                        <p className="text-[11px] text-[var(--text-tertiary)]">
                                          {formatShortDate(exam.date)} · {formatCountdown(daysUntil)}
                                        </p>
                                      </div>
                                    </button>
                                  </motion.li>
                                )
                              })}
                            </ul>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Footer with FAB */}
              <div className="flex items-center justify-end border-t border-[var(--border)] px-5 py-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddEvent}
                  className="flex items-center gap-2 rounded-xl bg-[var(--text)] px-4 py-2.5 text-[13px] font-medium text-[var(--bg)]"
                  aria-label="Añadir evento"
                >
                  <Plus size={16} />
                  Añadir evento
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Event Form Modal */}
      <EventForm
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        subjects={subjects}
        initialDate={selectedDate}
        editingEvent={editingEvent}
      />
    </>
  )
}

// Event item component
function EventItem({ event, subjects, onToggle, onEdit, onDelete, getEventTypeColor, getEventTypeLabel }) {
  const subject = subjects.find((s) => s.id === event.subjectId)

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 transition-all hover:border-[var(--text-tertiary)] ${
        event.completed ? 'opacity-50' : ''
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          event.completed
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
        }`}
      >
        {event.completed && <Check size={12} />}
      </motion.button>

      <div className="flex-1 min-w-0">
        <p
          className={`truncate text-[13px] font-medium text-[var(--text)] ${
            event.completed ? 'line-through' : ''
          }`}
        >
          {subject?.emoji && `${subject.emoji} `}
          {event.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${getEventTypeColor(event.type)}`} />
            {getEventTypeLabel(event.type)}
          </span>
          {event.time && <span>· {event.time}</span>}
          {event.duration && <span>· {event.duration}min</span>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onEdit}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-tertiary)] opacity-100 transition-all hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] md:opacity-0 md:group-hover:opacity-100"
          aria-label="Editar evento"
        >
          <Pencil size={14} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-tertiary)] opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Eliminar evento"
        >
          <Trash2 size={14} />
        </motion.button>
      </div>
    </div>
  )
}

// Progress ring component for exam countdown
function ProgressRing({ progress, daysUntil }) {
  const size = 40
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - progress * circumference

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--text)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-semibold tabular-nums text-[var(--text)]">
          {daysUntil >= 0 ? daysUntil : '−'}
        </span>
      </div>
    </div>
  )
}

export default CalendarPanel
