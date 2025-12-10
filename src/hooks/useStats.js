import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const getDateKey = (date = new Date()) => date.toISOString().split('T')[0]

const MIN_DAILY_TIME = 25 * 60 // 25 minutos mínimo para contar el día

const getWeekStart = (date = new Date()) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return getDateKey(d)
}

// Asegurar que un subject tenga todos los campos necesarios
const migrateSubject = (subject) => ({
  id: subject.id,
  name: subject.name,
  color: subject.color || '#141414',
  icon: subject.icon || null,
  emoji: subject.emoji || null,
  workDuration: subject.workDuration || 25 * 60,
  breakDuration: subject.breakDuration || 5 * 60,
  todos: subject.todos || [],
})

export function useStats() {
  const [sessions, setSessions] = useLocalStorage('zeitgeist-sessions', [])
  const [rawSubjects, setSubjects] = useLocalStorage('zeitgeist-subjects', [
    { id: '1', name: 'General', color: '#141414', icon: null, emoji: '💻', workDuration: 25 * 60, breakDuration: 5 * 60, todos: [] },
  ])

  // Migrar subjects existentes para añadir campos faltantes
  const subjects = rawSubjects.map(migrateSubject)
  const [weeklyGoal, setWeeklyGoal] = useLocalStorage('zeitgeist-weekly-goal', 20 * 60 * 60) // 20 hours
  const [currentSubject, setCurrentSubject] = useLocalStorage('zeitgeist-current-subject', '1')

  const addSession = (duration, subjectId = currentSubject) => {
    const newSession = {
      id: Date.now().toString(),
      date: getDateKey(),
      timestamp: Date.now(),
      duration, // in seconds
      subjectId,
    }
    setSessions((prev) => [...prev, newSession])
  }

  const addSubject = (name) => {
    const newSubject = {
      id: Date.now().toString(),
      name,
      color: '#141414',
      icon: null,
      emoji: null,
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
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
    setSubjects((prev) => prev.filter((s) => s.id !== id))
    if (currentSubject === id) {
      setCurrentSubject(subjects[0].id)
    }
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
