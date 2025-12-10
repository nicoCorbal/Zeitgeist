import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { TodoList } from './TodoList'
import { formatDuration } from '../utils/time'

export function SubjectView({
  isOpen,
  onClose,
  subject,
  subjectStats,
  weeklyGoal,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) {
  if (!subject) return null

  const Icon = subject.icon ? LucideIcons[subject.icon] : null
  const weekProgress = subjectStats ? (subjectStats / weeklyGoal) * 100 : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]"
        >
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 border-b border-[var(--border)] px-6 py-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="rounded-full p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div className="flex items-center gap-3">
              {subject.emoji && (
                <span className="text-2xl">{subject.emoji}</span>
              )}
              {Icon && !subject.emoji && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: subject.color + '20', color: subject.color }}
                >
                  <Icon size={18} />
                </div>
              )}
              <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--text)]">
                {subject.name}
              </h1>
            </div>
          </motion.header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-lg p-6">
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-[var(--border)] p-4"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                  Esta semana
                </span>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text)]">
                  {formatDuration(subjectStats || 0)}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: subject.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(weekProgress, 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
                  {Math.round(weekProgress)}% de tu meta semanal
                </p>
              </motion.div>

              {/* Todos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                  Tareas
                </h2>
                <div className="mt-4">
                  <TodoList
                    todos={subject.todos || []}
                    onAdd={(text) => onAddTodo(subject.id, text)}
                    onToggle={(todoId) => onToggleTodo(subject.id, todoId)}
                    onDelete={(todoId) => onDeleteTodo(subject.id, todoId)}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
