import { useLocalStorage } from './useLocalStorage'

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange']

export const NOTE_COLORS = {
  yellow: { bg: '#fef08a', text: '#713f12' },
  pink: { bg: '#fbcfe8', text: '#831843' },
  blue: { bg: '#bfdbfe', text: '#1e3a8a' },
  green: { bg: '#bbf7d0', text: '#14532d' },
  purple: { bg: '#ddd6fe', text: '#4c1d95' },
  orange: { bg: '#fed7aa', text: '#7c2d12' },
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function useStickyNotes(subjectId = null) {
  const [allNotes, setAllNotes] = useLocalStorage('denso-sticky-notes', [])
  const [notesVisible, setNotesVisible] = useLocalStorage('denso-sticky-notes-visible', true)

  // Filter notes by subject
  const notes = subjectId
    ? allNotes.filter((note) => note.subjectId === subjectId)
    : allNotes

  const addNote = (x = 100, y = 100) => {
    const newNote = {
      id: generateId(),
      subjectId,
      content: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x,
      y,
      width: 180,
      height: 140,
      createdAt: Date.now(),
    }
    setAllNotes((prev) => [...prev, newNote])
    return newNote.id
  }

  const updateNote = (id, updates) => {
    setAllNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      )
    )
  }

  const deleteNote = (id) => {
    setAllNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const updatePosition = (id, x, y) => {
    updateNote(id, { x, y })
  }

  const updateContent = (id, content) => {
    updateNote(id, { content })
  }

  const updateColor = (id, color) => {
    updateNote(id, { color })
  }

  const updateSize = (id, width, height) => {
    updateNote(id, { width, height })
  }

  const cycleColor = (id) => {
    const note = allNotes.find((n) => n.id === id)
    if (!note) return
    const currentIndex = COLORS.indexOf(note.color)
    const nextIndex = (currentIndex + 1) % COLORS.length
    updateNote(id, { color: COLORS[nextIndex] })
  }

  const clearSubjectNotes = () => {
    if (subjectId) {
      setAllNotes((prev) => prev.filter((note) => note.subjectId !== subjectId))
    }
  }

  const clearAllNotes = () => {
    setAllNotes([])
  }

  const toggleVisibility = () => {
    setNotesVisible((prev) => !prev)
  }

  return {
    notes,
    allNotes,
    notesVisible,
    addNote,
    updateNote,
    deleteNote,
    updatePosition,
    updateContent,
    updateColor,
    updateSize,
    cycleColor,
    clearSubjectNotes,
    clearAllNotes,
    toggleVisibility,
    setNotesVisible,
    colors: COLORS,
  }
}
