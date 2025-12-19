import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const getDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CalendarGrid({
  year,
  month,
  events = [],
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) {
  const { t } = useTranslation()
  const today = getDateKey(new Date())

  // Get translated days and months from translation file
  const DAYS = t('calendar.days', { returnObjects: true })
  const MONTHS = t('calendar.months', { returnObjects: true })

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    let startDay = firstDay.getDay()
    startDay = startDay === 0 ? 6 : startDay - 1

    const result = []

    for (let i = 0; i < startDay; i++) {
      result.push({ day: null, dateKey: null })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateKey = getDateKey(date)
      result.push({ day: d, dateKey })
    }

    return result
  }, [year, month])

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [events])

  return (
    <div className="select-none rounded-xl border border-[var(--border)] p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
          aria-label={t('calendar.prevMonth')}
        >
          <ChevronLeft size={18} />
        </motion.button>

        <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--text)]">
          {Array.isArray(MONTHS) ? MONTHS[month] : ''} {year}
        </h3>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
          aria-label={t('calendar.nextMonth')}
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Days of week */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {Array.isArray(DAYS) && DAYS.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((item, idx) => {
          if (!item.day) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const isToday = item.dateKey === today
          const isSelected = item.dateKey === selectedDate
          const dayEvents = eventsByDate[item.dateKey] || []
          const hasExam = dayEvents.some((e) => e.type === 'exam')
          const hasBlock = dayEvents.some((e) => e.type === 'study-block')
          const hasPersonal = dayEvents.some((e) => e.type === 'personal')

          return (
            <motion.button
              key={item.dateKey}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(item.dateKey)}
              className={`
                relative flex aspect-square flex-col items-center justify-center rounded-lg
                text-[13px] font-medium transition-all
                ${isSelected
                  ? 'bg-[var(--text)] text-[var(--bg)]'
                  : isToday
                    ? 'bg-[var(--text)]/10 font-semibold text-[var(--text)]'
                    : 'hover:bg-[var(--bg-secondary)]'
                }
              `}
            >
              <span>{item.day}</span>

              {(hasExam || hasBlock || hasPersonal) && (
                <div className="absolute bottom-1.5 flex gap-0.5">
                  {hasExam && (
                    <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-[var(--bg)]' : 'bg-red-500'}`} />
                  )}
                  {hasBlock && (
                    <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-[var(--bg)]' : 'bg-blue-500'}`} />
                  )}
                  {hasPersonal && (
                    <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-[var(--bg)]' : 'bg-pink-500'}`} />
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span>{t('calendar.exam')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>{t('calendar.study')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
          <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
          <span>{t('calendar.personal')}</span>
        </div>
      </div>
    </div>
  )
}
