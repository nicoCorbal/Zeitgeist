import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote } from './StickyNote'
import { NOTE_COLORS } from '../hooks/useStickyNotes'

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange']

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function StickyNotesLayer({ isVisible = true, subjectId = null, allNotes = [], setAllNotes }) {
  const containerRef = useRef(null)

  // Filter notes by subject
  const notes = subjectId
    ? allNotes.filter((note) => note.subjectId === subjectId)
    : allNotes

  const addNote = useCallback((x = 100, y = 100) => {
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
  }, [subjectId, setAllNotes])

  const updateNote = useCallback((id, updates) => {
    setAllNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      )
    )
  }, [setAllNotes])

  const deleteNote = useCallback((id) => {
    setAllNotes((prev) => prev.filter((note) => note.id !== id))
  }, [setAllNotes])

  const updatePosition = useCallback((id, x, y) => {
    updateNote(id, { x, y })
  }, [updateNote])

  const updateContent = useCallback((id, content) => {
    updateNote(id, { content })
  }, [updateNote])

  const updateSize = useCallback((id, width, height) => {
    updateNote(id, { width, height })
  }, [updateNote])

  const cycleColor = useCallback((id) => {
    const note = allNotes.find((n) => n.id === id)
    if (!note) return
    const currentIndex = COLORS.indexOf(note.color)
    const nextIndex = (currentIndex + 1) % COLORS.length
    updateNote(id, { color: COLORS[nextIndex] })
  }, [allNotes, updateNote])

  // Global double-click handler
  useEffect(() => {
    if (!isVisible) return

    const handleDoubleClick = (e) => {
      // Ignore if clicking on interactive elements
      const target = e.target
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="dialog"]') ||
        target.closest('.sticky-note')
      ) {
        return
      }

      // Prevent text selection
      e.preventDefault()
      window.getSelection()?.removeAllRanges()

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left - 90
      const y = e.clientY - rect.top - 70
      addNote(Math.max(10, x), Math.max(10, y))
    }

    window.addEventListener('dblclick', handleDoubleClick)
    return () => window.removeEventListener('dblclick', handleDoubleClick)
  }, [isVisible, addNote])

  if (!isVisible) return null

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{
        top: 'env(safe-area-inset-top)',
        bottom: 'env(safe-area-inset-bottom)',
        left: 'env(safe-area-inset-left)',
        right: 'env(safe-area-inset-right)',
      }}
    >
      {/* Notes */}
      <AnimatePresence>
        {notes.map((note) => (
          <div key={note.id} className="pointer-events-auto">
            <StickyNote
              note={note}
              onUpdatePosition={updatePosition}
              onUpdateContent={updateContent}
              onUpdateSize={updateSize}
              onCycleColor={cycleColor}
              onDelete={deleteNote}
              containerRef={containerRef}
            />
          </div>
        ))}
      </AnimatePresence>

    </div>
  )
}
