import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { TodoItem } from './TodoItem'

export function TodoList({ todos = [], onAdd, onToggle, onDelete }) {
  const [newTodo, setNewTodo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newTodo.trim()) {
      onAdd(newTodo.trim())
      setNewTodo('')
    }
  }

  const pendingTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)

  return (
    <div className="space-y-4">
      {/* Input para nueva tarea */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Nueva tarea..."
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 text-[14px] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--text-tertiary)]"
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!newTodo.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--text)] text-[var(--bg)] transition-opacity disabled:opacity-30"
        >
          <Plus size={18} />
        </motion.button>
      </form>

      {/* Lista de tareas pendientes */}
      {pendingTodos.length > 0 && (
        <div className="divide-y divide-[var(--border-light)]">
          <AnimatePresence mode="popLayout">
            {pendingTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => onToggle(todo.id)}
                onDelete={() => onDelete(todo.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lista de tareas completadas */}
      {completedTodos.length > 0 && (
        <div className="mt-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
            Completadas ({completedTodos.length})
          </span>
          <div className="mt-2 divide-y divide-[var(--border-light)]">
            <AnimatePresence mode="popLayout">
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => onToggle(todo.id)}
                  onDelete={() => onDelete(todo.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {todos.length === 0 && (
        <p className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">
          Sin tareas pendientes
        </p>
      )}
    </div>
  )
}
