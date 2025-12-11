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

// Asegurar que un subject tenga todos los campos necesarios
const migrateSubject = (subject) => ({
  id: subject.id,
  name: subject.name,
  color: subject.color || '#141414',
  icon: subject.icon || null,
  emoji: subject.emoji || null,
  workDuration: subject.workDuration || 25 * 60,
  breakDuration: subject.breakDuration || 5 * 60,
  longBreakDuration: subject.longBreakDuration || 15 * 60,
  longBreakInterval: subject.longBreakInterval ?? 4,
  todos: subject.todos || [],
  tags: subject.tags || [],
})

export function useStats() {
  const [sessions, setSessions] = useLocalStorage('zeitgeist-sessions', [])
  const [rawSubjects, setSubjects] = useLocalStorage('zeitgeist-subjects', [
    { id: '1', name: 'General', color: '#141414', icon: null, emoji: '💻', workDuration: 25 * 60, breakDuration: 5 * 60, todos: [] },
  ])
  const [tags, setTags] = useLocalStorage('zeitgeist-tags', [])

  // Migrar subjects existentes para añadir campos faltantes
  const subjects = rawSubjects.map(migrateSubject)
  const [weeklyGoal, setWeeklyGoal] = useLocalStorage('zeitgeist-weekly-goal', 20 * 60 * 60) // 20 hours
  const [currentSubject, setCurrentSubject] = useLocalStorage('zeitgeist-current-subject', '1')

  const addSession = (duration, subjectId = currentSubject, energyLevel = null, flowLevel = null) => {
    const newSession = {
      id: Date.now().toString(),
      date: getDateKey(),
      timestamp: Date.now(),
      duration, // in seconds
      subjectId,
      energyLevel, // 'low', 'normal', 'high' or null
      flowLevel, // 1 (difficult), 2 (normal), 3 (flow) or null
    }
    setSessions((prev) => [...prev, newSession])
  }

  const addSubject = (name, emoji = null) => {
    const newSubject = {
      id: Date.now().toString(),
      name,
      color: '#141414',
      icon: null,
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

  // Tags CRUD
  const addTag = (name, color = '#666666') => {
    const newTag = {
      id: Date.now().toString(),
      name,
      color,
    }
    setTags((prev) => [...prev, newTag])
    return newTag.id
  }

  const updateTag = (id, updates) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  const deleteTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
    // También quitar el tag de todas las asignaturas
    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        tags: (s.tags || []).filter((tagId) => tagId !== id),
      }))
    )
  }

  const addTagToSubject = (subjectId, tagId) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId && !(s.tags || []).includes(tagId)
          ? { ...s, tags: [...(s.tags || []), tagId] }
          : s
      )
    )
  }

  const removeTagFromSubject = (subjectId, tagId) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, tags: (s.tags || []).filter((id) => id !== tagId) }
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

    // Energy insights - analyze sessions with energy data
    const sessionsWithEnergy = sessions.filter((s) => s.energyLevel && s.flowLevel)

    // Average flow by energy level
    const flowByEnergy = { low: [], normal: [], high: [] }
    sessionsWithEnergy.forEach((s) => {
      if (flowByEnergy[s.energyLevel]) {
        flowByEnergy[s.energyLevel].push(s.flowLevel)
      }
    })

    const avgFlowByEnergy = {}
    Object.entries(flowByEnergy).forEach(([energy, flows]) => {
      if (flows.length > 0) {
        avgFlowByEnergy[energy] = flows.reduce((a, b) => a + b, 0) / flows.length
      }
    })

    // Best hour analysis (when flow is highest)
    const flowByHour = {}
    sessionsWithEnergy.forEach((s) => {
      const hour = new Date(s.timestamp).getHours()
      if (!flowByHour[hour]) flowByHour[hour] = []
      flowByHour[hour].push(s.flowLevel)
    })

    let bestHour = null
    let bestHourAvg = 0
    Object.entries(flowByHour).forEach(([hour, flows]) => {
      if (flows.length >= 2) { // Need at least 2 sessions to be significant
        const avg = flows.reduce((a, b) => a + b, 0) / flows.length
        if (avg > bestHourAvg) {
          bestHourAvg = avg
          bestHour = parseInt(hour)
        }
      }
    })

    // Best day analysis
    const flowByDay = {}
    sessionsWithEnergy.forEach((s) => {
      const day = new Date(s.timestamp).getDay()
      if (!flowByDay[day]) flowByDay[day] = []
      flowByDay[day].push(s.flowLevel)
    })

    let bestDay = null
    let bestDayAvg = 0
    Object.entries(flowByDay).forEach(([day, flows]) => {
      if (flows.length >= 2) {
        const avg = flows.reduce((a, b) => a + b, 0) / flows.length
        if (avg > bestDayAvg) {
          bestDayAvg = avg
          bestDay = parseInt(day)
        }
      }
    })

    // Energy distribution this week
    const energyDistribution = { low: 0, normal: 0, high: 0 }
    weekSessions.forEach((s) => {
      if (s.energyLevel && energyDistribution[s.energyLevel] !== undefined) {
        energyDistribution[s.energyLevel]++
      }
    })

    return {
      todayTotal,
      weekTotal,
      streak,
      weeklyProgress: weekTotal / weeklyGoal,
      subjectTime,
      recentSessions: sessions.slice(-10).reverse(),
      // Energy insights
      energyInsights: {
        avgFlowByEnergy,
        bestHour,
        bestHourAvg,
        bestDay,
        bestDayAvg,
        energyDistribution,
        totalSessionsWithData: sessionsWithEnergy.length,
      },
    }
  }, [sessions, weeklyGoal])

  return {
    sessions,
    subjects,
    currentSubject,
    weeklyGoal,
    stats,
    tags,
    addSession,
    addSubject,
    updateSubject,
    deleteSubject,
    setCurrentSubject,
    setWeeklyGoal,
    addTodo,
    toggleTodo,
    deleteTodo,
    addTag,
    updateTag,
    deleteTag,
    addTagToSubject,
    removeTagFromSubject,
  }
}
