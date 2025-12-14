import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const MIN_DAILY_TIME = 25 * 60 // 25 minutos mínimo para contar el día

const getWeekStart = (date = new Date()) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return getDateKey(d)
}

// Expand compact session to full format (backwards compatible)
const expandSession = (s) => {
  // Already expanded format
  if (s.id && s.date && s.timestamp) return s
  // Compact format
  const timestamp = s.t || s.timestamp
  return {
    id: String(timestamp),
    date: getDateKey(new Date(timestamp)),
    timestamp,
    duration: s.d ?? s.duration,
    subjectId: s.s || s.subjectId,
  }
}

// Compact session for storage
const compactSession = (s) => ({
  t: s.timestamp || s.t,
  d: s.duration || s.d,
  s: s.subjectId || s.s,
})

// Asegurar que un subject tenga todos los campos necesarios
const migrateSubject = (subject) => ({
  id: subject.id,
  name: subject.name,
  emoji: subject.emoji || null,
  workDuration: subject.workDuration || 25 * 60,
  breakDuration: subject.breakDuration || 5 * 60,
  longBreakDuration: subject.longBreakDuration || 15 * 60,
  longBreakInterval: subject.longBreakInterval ?? 4,
  todos: subject.todos || [],
})

export function useStats() {
  const [rawSessions, setRawSessions] = useLocalStorage('denso-sessions', [])

  // Expand sessions for use in components
  const sessions = useMemo(() => rawSessions.map(expandSession), [rawSessions])
  const [rawSubjects, setSubjects] = useLocalStorage('denso-subjects', [
    { id: '1', name: 'General', emoji: '💻', workDuration: 25 * 60, breakDuration: 5 * 60, todos: [] },
  ])

  // Migrar subjects existentes para añadir campos faltantes
  const subjects = rawSubjects.map(migrateSubject)
  const [weeklyGoal, setWeeklyGoal] = useLocalStorage('denso-weekly-goal', 20 * 60 * 60) // 20 hours
  const [currentSubject, setCurrentSubject] = useLocalStorage('denso-current-subject', '1')

  const addSession = (duration, subjectId = currentSubject) => {
    const newSession = compactSession({
      timestamp: Date.now(),
      duration,
      subjectId,
    })
    setRawSessions((prev) => [...prev, newSession])
  }

  const addSubject = (name, emoji = null) => {
    const newSubject = {
      id: Date.now().toString(),
      name,
      emoji,
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      longBreakInterval: 4,
      todos: [],
    }
    setSubjects((prev) => [...prev, newSubject])
    return newSubject.id
  }

  const updateSubject = (id, updates) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteSubject = (id) => {
    if (subjects.length <= 1) return // No permitir borrar el último
    setSubjects((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      // Update currentSubject inside callback to avoid race condition
      if (currentSubject === id && filtered.length > 0) {
        setCurrentSubject(filtered[0].id)
      }
      return filtered
    })
  }

  // Todo CRUD
  const addTodo = (subjectId, text) => {
    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
    }
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, todos: [...(s.todos || []), newTodo] }
          : s
      )
    )
  }

  const toggleTodo = (subjectId, todoId) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              todos: (s.todos || []).map((t) =>
                t.id === todoId ? { ...t, completed: !t.completed } : t
              ),
            }
          : s
      )
    )
  }

  const deleteTodo = (subjectId, todoId) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, todos: (s.todos || []).filter((t) => t.id !== todoId) }
          : s
      )
    )
  }

  const stats = useMemo(() => {
    const today = getDateKey()
    const weekStart = getWeekStart()

    const todaySessions = sessions.filter((s) => s.date === today)
    const weekSessions = sessions.filter((s) => s.date >= weekStart)

    const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0)
    const weekTotal = weekSessions.reduce((sum, s) => sum + s.duration, 0)

    // Calculate streak - solo cuenta días con >= 25 min
    let streak = 0
    const timeByDate = {}
    sessions.forEach((s) => {
      timeByDate[s.date] = (timeByDate[s.date] || 0) + s.duration
    })

    // Filtrar solo días que cumplen el mínimo
    const validDates = Object.entries(timeByDate)
      .filter(([, time]) => time >= MIN_DAILY_TIME)
      .map(([date]) => date)
      .sort()
      .reverse()

    const checkDate = new Date()

    for (const dateStr of validDates) {
      const dateKey = getDateKey(checkDate)
      if (dateStr === dateKey) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr < dateKey) {
        // Check if yesterday
        checkDate.setDate(checkDate.getDate() - 1)
        if (dateStr === getDateKey(checkDate)) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    // Time per subject this week
    const subjectTime = {}
    weekSessions.forEach((s) => {
      subjectTime[s.subjectId] = (subjectTime[s.subjectId] || 0) + s.duration
    })

    return {
      todayTotal,
      weekTotal,
      streak,
      weeklyProgress: weekTotal / weeklyGoal,
      subjectTime,
      recentSessions: sessions.slice(-10).reverse(),
    }
  }, [sessions, weeklyGoal])

  return {
    sessions,
    subjects,
    currentSubject,
    weeklyGoal,
    stats,
    addSession,
    addSubject,
    updateSubject,
    deleteSubject,
    setCurrentSubject,
    setWeeklyGoal,
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}
