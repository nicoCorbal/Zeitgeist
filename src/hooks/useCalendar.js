import { useMemo, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Compact type codes: s=study-block, e=exam, p=personal
const TYPE_TO_CODE = { 'study-block': 's', 'exam': 'e', 'personal': 'p' }
const CODE_TO_TYPE = { 's': 'study-block', 'e': 'exam', 'p': 'personal' }

// Expand compact event to full format
const expandEvent = (e) => ({
  id: e.i || e.id || `fallback-${e.a || Date.now()}`,
  type: CODE_TO_TYPE[e.t] || e.type || 'study-block', // Support both formats
  title: e.n || e.title,
  date: e.d || e.date,
  time: e.h || e.time || null,
  duration: e.m || e.duration || null,
  subjectId: e.s || e.subjectId || null,
  completed: e.c === 1 || e.completed || false,
  createdAt: e.a || e.createdAt,
})

// Compact event for storage (omit null values)
const compactEvent = (e) => {
  const compact = {
    i: e.id || e.i,
    t: TYPE_TO_CODE[e.type] || e.t || 's',
    n: e.title || e.n,
    d: e.date || e.d,
    a: e.createdAt || e.a,
  }
  if (e.time || e.h) compact.h = e.time || e.h
  if (e.duration || e.m) compact.m = e.duration || e.m
  if (e.subjectId || e.s) compact.s = e.subjectId || e.s
  if (e.completed || e.c) compact.c = 1
  return compact
}

export function useCalendar() {
  const [rawEvents, setRawEvents] = useLocalStorage('denso-events', [])

  // Expand events for use in components
  const events = useMemo(() => rawEvents.map(expandEvent), [rawEvents])

  const addEvent = useCallback((eventData) => {
    const newEvent = compactEvent({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
      type: eventData.type || 'study-block',
      title: eventData.title,
      date: eventData.date,
      time: eventData.time || null,
      duration: eventData.duration || null,
      subjectId: eventData.subjectId || null,
      completed: false,
      createdAt: Date.now(),
    })
    setRawEvents((prev) => [...prev, newEvent])
    return newEvent.i
  }, [setRawEvents])

  const updateEvent = useCallback((id, updates) => {
    setRawEvents((prev) =>
      prev.map((e) => {
        if ((e.i || e.id) !== id) return e
        // Expand, merge updates, compact again
        const expanded = expandEvent(e)
        return compactEvent({ ...expanded, ...updates })
      })
    )
  }, [setRawEvents])

  const deleteEvent = useCallback((id) => {
    setRawEvents((prev) => prev.filter((e) => (e.i || e.id) !== id))
  }, [setRawEvents])

  const toggleComplete = useCallback((id) => {
    setRawEvents((prev) =>
      prev.map((e) => {
        if ((e.i || e.id) !== id) return e
        // Toggle completed flag in compact format
        if (e.c === 1) {
          const { c: _c, ...rest } = e
          return rest
        }
        return { ...e, c: 1 }
      })
    )
  }, [setRawEvents])

  // Completar bloque de estudio por asignatura y fecha
  const completeStudyBlock = useCallback((subjectId, date) => {
    setRawEvents((prev) => {
      const idx = prev.findIndex((e) => {
        const type = CODE_TO_TYPE[e.t] || e.type
        const eventDate = e.d || e.date
        const eventSubject = e.s || e.subjectId
        const completed = e.c === 1 || e.completed
        return type === 'study-block' &&
          eventDate === date &&
          eventSubject === subjectId &&
          !completed
      })
      if (idx === -1) return prev
      const updated = [...prev]
      updated[idx] = { ...updated[idx], c: 1 }
      return updated
    })
  }, [setRawEvents])

  const getEventsForDate = useCallback((date) => {
    const dateKey = typeof date === 'string' ? date : getDateKey(date)
    return events.filter((e) => e.date === dateKey)
  }, [events])

  const getEventsForMonth = useCallback((year, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return events.filter((e) => e.date.startsWith(prefix))
  }, [events])

  const upcomingEvents = useMemo(() => {
    const today = getDateKey()
    return events
      .filter((e) => e.date >= today && !e.completed)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [events])

  const upcomingExams = useMemo(() => {
    const today = getDateKey()
    return events
      .filter((e) => e.type === 'exam' && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [events])

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
    completeStudyBlock,
    getEventsForDate,
    getEventsForMonth,
    upcomingEvents,
    upcomingExams,
  }
}
