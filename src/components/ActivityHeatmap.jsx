import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

/**
 * Compact activity heatmap - shows last 16 weeks
 * Designed to fit nicely in the stats panel
 */

// Month abbreviations - J F M A M J J A S O N D
const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

// Get intensity level (0-4) based on minutes studied
function getIntensity(minutes) {
  if (minutes === 0) return 0
  if (minutes < 25) return 1
  if (minutes < 60) return 2
  if (minutes < 120) return 3
  return 4
}

// Intensity colors - green tones like GitHub
const INTENSITY_COLORS = [
  'var(--heatmap-0, rgba(0,0,0,0.05))',
  'var(--heatmap-1, #9be9a8)',
  'var(--heatmap-2, #40c463)',
  'var(--heatmap-3, #30a14e)',
  'var(--heatmap-4, #216e39)',
]

// Format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

// Get the Monday of a week
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export function ActivityHeatmap({ sessions = [] }) {
  const { t, i18n } = useTranslation()
  const [hoveredDay, setHoveredDay] = useState(null)

  // Process sessions into a map of date -> minutes
  const activityMap = useMemo(() => {
    const map = new Map()
    sessions.forEach((session) => {
      const date = session.date?.split('T')[0]
      if (date) {
        const current = map.get(date) || 0
        map.set(date, current + Math.round(session.duration / 60))
      }
    })
    return map
  }, [sessions])

  // Generate weeks for the last 16 weeks (more compact)
  const { weeks, monthLabels } = useMemo(() => {
    const weeksResult = []
    const labels = []
    const today = new Date()
    const numWeeks = 16
    const startDate = getMonday(new Date(today.getTime() - (numWeeks - 1) * 7 * 24 * 60 * 60 * 1000))

    let lastMonth = -1

    for (let week = 0; week < numWeeks; week++) {
      const weekDays = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate.getTime() + (week * 7 + day) * 24 * 60 * 60 * 1000)
        const dateStr = formatDate(date)
        const minutes = activityMap.get(dateStr) || 0

        // Track month changes for labels
        if (day === 0) {
          const month = date.getMonth()
          if (month !== lastMonth) {
            labels.push({ month, week })
            lastMonth = month
          }
        }

        weekDays.push({
          date: dateStr,
          minutes,
          intensity: getIntensity(minutes),
          isToday: dateStr === formatDate(today),
          isFuture: date > today,
          dayOfWeek: day,
        })
      }
      weeksResult.push(weekDays)
    }
    return { weeks: weeksResult, monthLabels: labels }
  }, [activityMap])

  // Calculate summary stats
  const stats = useMemo(() => {
    let totalDays = 0
    let totalMinutes = 0

    weeks.flat().forEach((day) => {
      if (day.minutes > 0 && !day.isFuture) {
        totalDays++
        totalMinutes += day.minutes
      }
    })

    return { totalDays, totalMinutes }
  }, [weeks])

  return (
    <div className="w-full">
      {/* Header with stats */}
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-[13px] text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text)]">{stats.totalDays}</span> {t('stats.activeDays')}
          {stats.totalMinutes > 0 && (
            <span className="ml-2 text-[var(--text-tertiary)]">
              · {Math.round(stats.totalMinutes / 60)}{t('stats.totalHours')}
            </span>
          )}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="relative">
        {/* Month labels */}
        <div className="mb-1 flex h-3">
          {monthLabels.map((label, i) => (
            <div
              key={i}
              className="text-[9px] font-medium text-[var(--text-tertiary)]"
              style={{
                position: 'absolute',
                left: `${(label.week / 16) * 100}%`,
              }}
            >
              {MONTHS_SHORT[label.month]}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <motion.div
                  key={day.date}
                  className="relative cursor-pointer"
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  whileHover={{ scale: 1.3 }}
                  transition={{ duration: 0.1 }}
                >
                  <div
                    className={`h-[12px] w-[12px] rounded-[3px] transition-all ${
                      day.isFuture ? 'opacity-0' : ''
                    } ${day.isToday ? 'ring-1 ring-[var(--text)] ring-offset-1 ring-offset-[var(--bg)]' : ''}`}
                    style={{
                      backgroundColor: day.isFuture ? 'transparent' : INTENSITY_COLORS[day.intensity],
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && !hoveredDay.isFuture && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--text)] px-3 py-2 text-center shadow-lg"
          >
            <div className="text-[12px] font-medium text-[var(--bg)]">
              {hoveredDay.minutes > 0
                ? `${hoveredDay.minutes} min`
                : t('todos.empty')}
            </div>
            <div className="text-[10px] text-[var(--bg)]/60">
              {new Date(hoveredDay.date).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </div>
            {/* Arrow */}
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--text)]" />
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[10px] text-[var(--text-tertiary)]">
          {t('stats.last16Weeks')}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--text-tertiary)]">{t('stats.less')}</span>
          {INTENSITY_COLORS.map((color, i) => (
            <div
              key={i}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] text-[var(--text-tertiary)]">{t('stats.more')}</span>
        </div>
      </div>
    </div>
  )
}
