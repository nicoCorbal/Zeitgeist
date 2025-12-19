import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NOTE_COLORS } from '../hooks/useStickyNotes'

const MIN_WIDTH = 140
const MIN_HEIGHT = 100
const MAX_WIDTH = 400
const MAX_HEIGHT = 400

export function StickyNote({
  note,
  onUpdatePosition,
  onUpdateContent,
  onUpdateSize,
  onCycleColor,
  onDelete,
  containerRef,
}) {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState(note.content)
  const textareaRef = useRef(null)
  const noteRef = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 })

  const colors = NOTE_COLORS[note.color] || NOTE_COLORS.yellow
  const noteWidth = note.width || 180
  const noteHeight = note.height || 140

  // Sync local content with note content
  useEffect(() => {
    setLocalContent(note.content)
  }, [note.content])

  // Auto-edit new empty notes
  useEffect(() => {
    if (note.content === '' && !isEditing) {
      setIsEditing(true)
    }
  }, [])

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
      autoResize()
    }
  }, [isEditing])

  // Auto-resize note based on content
  const autoResize = () => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const savedScrollTop = textarea.scrollTop

    // Temporarily set height to auto to measure
    const originalHeight = textarea.style.height
    textarea.style.height = '0'
    const scrollHeight = textarea.scrollHeight
    textarea.style.height = originalHeight || '100%'
    textarea.scrollTop = savedScrollTop

    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, scrollHeight + 28 + 24)) // 28px header + 24px padding

    if (Math.abs(newHeight - noteHeight) > 5) {
      onUpdateSize(note.id, noteWidth, newHeight)
    }
  }

  // Drag handlers
  const handleMouseDown = (e) => {
    if (isEditing || isResizing) return
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('.resize-handle')) return

    setIsDragging(true)
    const rect = noteRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef?.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    let newX = e.clientX - containerRect.left - dragOffset.current.x
    let newY = e.clientY - containerRect.top - dragOffset.current.y

    newX = Math.max(0, Math.min(newX, containerRect.width - noteWidth))
    newY = Math.max(0, Math.min(newY, containerRect.height - noteHeight))

    onUpdatePosition(note.id, newX, newY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Resize handlers
  const handleResizeStart = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    resizeStart.current = {
      width: noteWidth,
      height: noteHeight,
      mouseX: e.clientX,
      mouseY: e.clientY,
    }
  }

  const handleResizeMove = (e) => {
    if (!isResizing) return

    const deltaX = e.clientX - resizeStart.current.mouseX
    const deltaY = e.clientY - resizeStart.current.mouseY

    let newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStart.current.width + deltaX))
    let newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStart.current.height + deltaY))

    onUpdateSize(note.id, newWidth, newHeight)
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
  }

  // Touch resize handlers
  const handleResizeTouchStart = (e) => {
    e.stopPropagation()
    setIsResizing(true)
    const touch = e.touches[0]
    resizeStart.current = {
      width: noteWidth,
      height: noteHeight,
      mouseX: touch.clientX,
      mouseY: touch.clientY,
    }
  }

  const handleResizeTouchMove = (e) => {
    if (!isResizing) return
    const touch = e.touches[0]

    const deltaX = touch.clientX - resizeStart.current.mouseX
    const deltaY = touch.clientY - resizeStart.current.mouseY

    let newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStart.current.width + deltaX))
    let newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStart.current.height + deltaY))

    onUpdateSize(note.id, newWidth, newHeight)
  }

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  // Global mouse events for resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
      window.addEventListener('touchmove', handleResizeTouchMove)
      window.addEventListener('touchend', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResizeMove)
        window.removeEventListener('mouseup', handleResizeEnd)
        window.removeEventListener('touchmove', handleResizeTouchMove)
        window.removeEventListener('touchend', handleResizeEnd)
      }
    }
  }, [isResizing])

  // Touch support for dragging
  const handleTouchStart = (e) => {
    if (isEditing || isResizing) return
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('.resize-handle')) return

    const touch = e.touches[0]
    const rect = noteRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef?.current) return

    const touch = e.touches[0]
    const containerRect = containerRef.current.getBoundingClientRect()
    let newX = touch.clientX - containerRect.left - dragOffset.current.x
    let newY = touch.clientY - containerRect.top - dragOffset.current.y

    newX = Math.max(0, Math.min(newX, containerRect.width - noteWidth))
    newY = Math.max(0, Math.min(newY, containerRect.height - noteHeight))

    onUpdatePosition(note.id, newX, newY)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (localContent !== note.content) {
      onUpdateContent(note.id, localContent)
    }
  }

  const handleKeyDown = (e) => {
    // Stop propagation to prevent triggering app shortcuts (space, r, s)
    e.stopPropagation()

    if (e.key === 'Escape') {
      setIsEditing(false)
      setLocalContent(note.content)
    }
  }

  return (
    <motion.div
      ref={noteRef}
      initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 2 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="sticky-note absolute select-none group"
      style={{
        left: note.x,
        top: note.y,
        width: noteWidth,
        height: noteHeight,
        zIndex: isDragging || isResizing ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      {/* Main note body */}
      <div
        className="relative w-full h-full rounded-sm overflow-hidden"
        style={{
          backgroundColor: colors.bg,
          cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : isEditing ? 'default' : 'grab',
          boxShadow: isDragging
            ? '0 12px 28px rgba(0,0,0,0.2), 0 8px 10px rgba(0,0,0,0.12)'
            : '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Top strip / header */}
        <div
          className="h-7 flex items-center justify-between px-2"
          style={{
            backgroundColor: colors.bg,
            borderBottom: `1px solid ${colors.text}15`,
          }}
        >
          {/* Drag indicator dots */}
          <div className="flex gap-0.5 opacity-40">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text }} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onCycleColor(note.id) }}
              className="flex h-5 w-5 items-center justify-center rounded transition-colors"
              style={{ color: colors.text }}
              aria-label="Change color"
            >
              <Palette size={13} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
              className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:text-red-500"
              style={{ color: colors.text }}
              aria-label="Delete note"
            >
              <X size={14} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        {/* Content area */}
        <div
          className="p-3 h-[calc(100%-28px)] overflow-auto scrollbar-hide"
          onClick={(e) => {
            if (!isEditing) {
              e.stopPropagation()
              setIsEditing(true)
            }
          }}
          style={{ cursor: isEditing ? 'text' : 'pointer' }}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={(e) => {
                setLocalContent(e.target.value)
                setTimeout(autoResize, 0)
              }}
              onPaste={() => setTimeout(autoResize, 0)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none bg-transparent text-[13px] leading-relaxed outline-none ring-0 border-none focus:outline-none focus:ring-0 placeholder:opacity-50"
              style={{ color: colors.text, boxShadow: 'none' }}
              placeholder={t('stickyNotes.placeholder')}
              autoFocus
            />
          ) : (
            <p
              className="text-[13px] leading-relaxed whitespace-pre-wrap break-words h-full"
              style={{ color: colors.text }}
            >
              {note.content || (
                <span className="opacity-50">{t('stickyNotes.placeholder')}</span>
              )}
            </p>
          )}
        </div>

        {/* Corner fold effect */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${colors.text}10 50%)`,
          }}
        />

        {/* Resize handle */}
        <div
          className="resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize opacity-0 group-hover:opacity-60 transition-opacity"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeTouchStart}
        >
          <svg
            viewBox="0 0 20 20"
            className="w-full h-full"
            style={{ color: colors.text }}
          >
            <path
              d="M14 16L16 14M10 16L16 10M6 16L16 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}
