import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Flame, Target, TrendingUp } from 'lucide-react'
import { formatDuration } from '../utils/time'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  }
}

export function StatsPanel({ isOpen, onClose, stats, subjects, weeklyGoal }) {
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || 'General'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[var(--bg)] shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4"
            >
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
                Estadísticas
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="rounded-full p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
              >
                <X size={18} />
              </motion.button>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Summary Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--text-tertiary)]">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Clock size={12} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        Hoy
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
                      {formatDuration(stats.todayTotal)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--text-tertiary)]">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Flame size={12} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        Racha
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
                      {stats.streak} días
                    </p>
                  </div>
                </motion.div>

                {/* Weekly Progress */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Target size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Esta semana
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xl font-semibold tracking-tight text-[var(--text)]">
                        {formatDuration(stats.weekTotal)}
                      </p>
                      <span className="text-[12px] text-[var(--text-tertiary)]">
                        / {formatDuration(weeklyGoal)}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--text)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stats.weeklyProgress * 100, 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-[var(--text-tertiary)]">
                      {Math.round(stats.weeklyProgress * 100)}% completado
                    </p>
                  </div>
                </motion.div>

                {/* Time by Subject */}
                {Object.keys(stats.subjectTime).length > 0 && (
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <TrendingUp size={12} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        Por materia
                      </span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {Object.entries(stats.subjectTime)
                        .sort(([, a], [, b]) => b - a)
                        .map(([subjectId, time], index) => {
                          const percentage = stats.weekTotal > 0 ? (time / stats.weekTotal) * 100 : 0
                          return (
                            <motion.div
                              key={subjectId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.05 }}
                            >
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="text-[var(--text)]">
                                  {getSubjectName(subjectId)}
                                </span>
                                <span className="tabular-nums text-[var(--text-secondary)]">
                                  {formatDuration(time)}
                                </span>
                              </div>
                              <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-[var(--border)]">
                                <motion.div
                                  className="h-full rounded-full bg-[var(--text)]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                                />
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                  </motion.div>
                )}

                {/* Recent Sessions */}
                {stats.recentSessions.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                      Sesiones recientes
                    </span>
                    <div className="mt-3 space-y-1">
                      {stats.recentSessions.slice(0, 5).map((session, index) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.03 }}
                          className="flex items-center justify-between rounded-lg py-1.5 text-[13px] transition-colors"
                        >
                          <span className="text-[var(--text)]">
                            {getSubjectName(session.subjectId)}
                          </span>
                          <span className="tabular-nums text-[var(--text-secondary)]">
                            {formatDuration(session.duration)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
