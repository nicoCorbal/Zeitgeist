import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Flame, Target, History } from 'lucide-react'
import { formatDuration, formatTimeAgo } from '../utils/time'

export function Stats({ isOpen, onClose, stats, subjects, weeklyGoal }) {
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || 'General'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto bg-[var(--bg-light)] p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
                Estadísticas
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)]"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-10 space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Clock size={14} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-widest">
                      Hoy
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {formatDuration(stats.todayTotal)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Flame size={14} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-widest">
                      Racha
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {stats.streak} días
                  </p>
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Target size={14} strokeWidth={1.5} />
                  <span className="text-[11px] font-medium uppercase tracking-widest">
                    Meta semanal
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-semibold tracking-tight text-[var(--text)]">
                      {formatDuration(stats.weekTotal)}
                    </p>
                    <span className="text-[13px] text-[var(--text-muted)]">
                      de {formatDuration(weeklyGoal)}
                    </span>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                    <motion.div
                      className="h-full rounded-full bg-[var(--text)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.weeklyProgress * 100, 100)}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--text-muted)]">
                    {Math.round(stats.weeklyProgress * 100)}% completado
                  </p>
                </div>
              </div>

              {/* Time by Subject */}
              {Object.keys(stats.subjectTime).length > 0 && (
                <div className="space-y-4">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
                    Por materia
                  </span>
                  <div className="space-y-3">
                    {Object.entries(stats.subjectTime)
                      .sort(([, a], [, b]) => b - a)
                      .map(([subjectId, time]) => {
                        const subject = subjects.find((s) => s.id === subjectId)
                        const percentage = (time / stats.weekTotal) * 100
                        return (
                          <div key={subjectId}>
                            <div className="flex items-center justify-between text-[13px]">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: subject?.color }}
                                />
                                <span className="text-[var(--text)]">
                                  {subject?.name || 'General'}
                                </span>
                              </div>
                              <span className="tabular-nums text-[var(--text-muted)]">
                                {formatDuration(time)}
                              </span>
                            </div>
                            <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-[var(--border)]">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: subject?.color || 'var(--text)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              {stats.recentSessions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <History size={14} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-widest">
                      Recientes
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stats.recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between py-1 text-[13px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--text)]">
                            {getSubjectName(session.subjectId)}
                          </span>
                          <span className="text-[var(--text-muted)]">
                            {formatTimeAgo(session.timestamp)}
                          </span>
                        </div>
                        <span className="tabular-nums text-[var(--text)]">
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
