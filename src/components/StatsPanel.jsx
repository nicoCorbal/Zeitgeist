import { useId, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Flame, Target, TrendingUp, Award, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../utils/time'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { DURATIONS, EASINGS } from '../utils/animations'
import { ActivityHeatmap } from './ActivityHeatmap'
import { AchievementsPanel } from './AchievementsPanel'
import { getAchievementProgress } from '../data/achievements'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: DURATIONS.instant
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth }
  }
}

export function StatsPanel({ isOpen, onClose, stats, subjects, weeklyGoal, sessions = [] }) {
  const { t } = useTranslation()
  const titleId = useId()
  const panelRef = useFocusTrap(isOpen, onClose)
  const [showAchievements, setShowAchievements] = useState(false)

  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || t('subjects.general')
  const getSubjectEmoji = (id) => subjects.find((s) => s.id === id)?.emoji || null

  // Get achievements progress
  const achievements = getAchievementProgress(sessions, stats)
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[var(--bg-solid)] shadow-2xl"
            style={{
              paddingTop: 'var(--safe-area-top)',
              paddingRight: 'var(--safe-area-right)',
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4"
            >
              <h2
                id={titleId}
                className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]"
              >
                {t('stats.title')}
              </h2>
              <motion.button
                data-close-button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="rounded-full p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                aria-label={t('common.close')}
              >
                <X size={18} aria-hidden="true" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Summary Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                  <article
                    className="rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--text-tertiary)]"
                    aria-label={`${t('stats.studyTimeToday')}: ${formatDuration(stats.todayTotal)}`}
                  >
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Clock size={12} aria-hidden="true" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        {t('stats.today')}
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
                      {formatDuration(stats.todayTotal)}
                    </p>
                  </article>

                  <article
                    className="rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--text-tertiary)]"
                    aria-label={`${t('stats.currentStreak')}: ${stats.streak} ${t('common.days')}`}
                  >
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Flame size={12} aria-hidden="true" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        {t('stats.streak')}
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
                      {stats.streak} {t('common.days')}
                    </p>
                  </article>
                </motion.div>

                {/* Weekly Progress */}
                <motion.section variants={itemVariants} aria-labelledby="weekly-section">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Target size={12} aria-hidden="true" />
                    <span id="weekly-section" className="text-[10px] font-semibold uppercase tracking-widest">
                      {t('stats.thisWeek')}
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
                    <div
                      className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--border)]"
                      role="progressbar"
                      aria-valuenow={Math.round(stats.weeklyProgress * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={t('stats.weeklyProgress')}
                    >
                      <motion.div
                        className="h-full rounded-full bg-[var(--text)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stats.weeklyProgress * 100, 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-[var(--text-tertiary)]">
                      {Math.round(stats.weeklyProgress * 100)}% {t('common.completed')}
                    </p>
                  </div>
                </motion.section>

                {/* Time by Subject */}
                {Object.keys(stats.subjectTime).length > 0 && (
                  <motion.section variants={itemVariants} aria-labelledby="subjects-section">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <TrendingUp size={12} aria-hidden="true" />
                      <span id="subjects-section" className="text-[10px] font-semibold uppercase tracking-widest">
                        {t('stats.bySubject')}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-3" aria-label={t('stats.bySubject')}>
                      {Object.entries(stats.subjectTime)
                        .sort(([, a], [, b]) => b - a)
                        .map(([subjectId, time], index) => {
                          const percentage = stats.weekTotal > 0 ? (time / stats.weekTotal) * 100 : 0
                          const emoji = getSubjectEmoji(subjectId)
                          return (
                            <motion.li
                              key={subjectId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.05 }}
                            >
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="flex items-center gap-2 text-[var(--text)]">
                                  {emoji && <span aria-hidden="true">{emoji}</span>}
                                  {getSubjectName(subjectId)}
                                </span>
                                <span className="tabular-nums text-[var(--text-secondary)]">
                                  {formatDuration(time)}
                                </span>
                              </div>
                              <div
                                className="mt-1 h-0.5 overflow-hidden rounded-full bg-[var(--border)]"
                                role="progressbar"
                                aria-valuenow={Math.round(percentage)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${getSubjectName(subjectId)}: ${Math.round(percentage)}% del tiempo total`}
                              >
                                <motion.div
                                  className="h-full rounded-full bg-[var(--text)]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                                />
                              </div>
                            </motion.li>
                          )
                        })}
                    </ul>
                  </motion.section>
                )}

                {/* Achievements Button */}
                <motion.section variants={itemVariants}>
                  <button
                    onClick={() => setShowAchievements(true)}
                    className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] p-4 text-left transition-colors hover:border-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text)]">
                        <Award size={20} className="text-[var(--bg)]" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[var(--text)]">{t('stats.achievements')}</div>
                        <div className="text-[12px] text-[var(--text-tertiary)]">
                          {unlockedCount} / {achievements.length} {t('stats.unlocked')}
                        </div>
                      </div>
                    </div>
                    <div
                      className="h-2 w-16 overflow-hidden rounded-full bg-[var(--bg-secondary)]"
                      role="progressbar"
                      aria-valuenow={unlockedCount}
                      aria-valuemax={achievements.length}
                    >
                      <div
                        className="h-full rounded-full bg-[var(--text)]"
                        style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                      />
                    </div>
                  </button>
                </motion.section>

                {/* Activity Heatmap */}
                <motion.section variants={itemVariants} aria-labelledby="heatmap-section">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Calendar size={12} aria-hidden="true" />
                    <span id="heatmap-section" className="text-[10px] font-semibold uppercase tracking-widest">
                      {t('stats.activity')}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ActivityHeatmap sessions={sessions} />
                  </div>
                </motion.section>

                {/* Recent Sessions */}
                {stats.recentSessions.length > 0 && (
                  <motion.section variants={itemVariants} aria-labelledby="recent-section">
                    <span id="recent-section" className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                      {t('stats.recentSessions')}
                    </span>
                    <ul className="mt-3 space-y-1" aria-label={t('stats.recentSessions')}>
                      {stats.recentSessions.slice(0, 5).map((session, index) => (
                        <motion.li
                          key={session.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.03 }}
                          className="flex items-center justify-between rounded-lg py-1.5 text-[13px] transition-colors"
                        >
                          <span className="flex items-center gap-2 text-[var(--text)]">
                            {getSubjectEmoji(session.subjectId) && (
                              <span aria-hidden="true">{getSubjectEmoji(session.subjectId)}</span>
                            )}
                            {getSubjectName(session.subjectId)}
                          </span>
                          <span className="tabular-nums text-[var(--text-secondary)]">
                            {formatDuration(session.duration)}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.section>
                )}
              </motion.div>
            </div>

            {/* Achievements Panel */}
            <AchievementsPanel
              isOpen={showAchievements}
              onClose={() => setShowAchievements(false)}
              achievements={achievements}
            />

            {/* Footer with safe area */}
            <div
              className="h-4"
              style={{ paddingBottom: 'var(--safe-area-bottom)' }}
              aria-hidden="true"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
