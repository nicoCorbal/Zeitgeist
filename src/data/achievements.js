/**
 * Achievement definitions for Denso
 * Gamification system to encourage consistent study habits
 */

export const ACHIEVEMENTS = [
  // Session milestones
  {
    id: 'first_session',
    icon: 'rocket',
    condition: (sessions) => sessions.length >= 1,
  },
  {
    id: 'sessions_10',
    icon: 'zap',
    condition: (sessions) => sessions.length >= 10,
  },
  {
    id: 'sessions_50',
    icon: 'star',
    condition: (sessions) => sessions.length >= 50,
  },
  {
    id: 'sessions_100',
    icon: 'trophy',
    condition: (sessions) => sessions.length >= 100,
  },
  {
    id: 'sessions_500',
    icon: 'crown',
    condition: (sessions) => sessions.length >= 500,
  },

  // Streak achievements
  {
    id: 'streak_3',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 7,
  },
  {
    id: 'streak_30',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 30,
  },
  {
    id: 'streak_100',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 100,
  },

  // Hour milestones
  {
    id: 'hours_10',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 10,
  },
  {
    id: 'hours_50',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 50,
  },
  {
    id: 'hours_100',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 100,
  },
  {
    id: 'hours_500',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 500,
  },
  {
    id: 'hours_1000',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 1000,
  },

  // Special achievements
  {
    id: 'early_bird',
    icon: 'sun',
    condition: (sessions) =>
      sessions.some((s) => {
        const date = new Date(s.timestamp || s.date)
        if (isNaN(date.getTime())) return false
        return date.getHours() < 7
      }),
  },
  {
    id: 'night_owl',
    icon: 'moon',
    condition: (sessions) =>
      sessions.some((s) => {
        const date = new Date(s.timestamp || s.date)
        if (isNaN(date.getTime())) return false
        return date.getHours() >= 23
      }),
  },
  {
    id: 'weekend_warrior',
    icon: 'calendar',
    condition: (sessions) => {
      let saturday = false
      let sunday = false
      sessions.forEach((s) => {
        const date = new Date(s.timestamp || s.date)
        if (isNaN(date.getTime())) return
        const day = date.getDay()
        if (day === 6) saturday = true
        if (day === 0) sunday = true
      })
      return saturday && sunday
    },
  },
  {
    id: 'long_session',
    icon: 'target',
    condition: (sessions) => sessions.some((s) => s.duration >= 7200),
  },
  {
    id: 'diverse',
    icon: 'book',
    condition: (sessions) => {
      const subjects = new Set(sessions.map((s) => s.subjectId).filter(Boolean))
      return subjects.size >= 5
    },
  },
]

// Helper function to get total hours
function getTotalHours(sessions) {
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration || 0), 0)
  return totalSeconds / 3600
}

/**
 * Check which achievements are unlocked
 * @param {Array} sessions - Array of session objects
 * @param {Object} stats - Current stats object with streak, weekTotal, etc.
 * @returns {Array} Array of unlocked achievement IDs
 */
export function getUnlockedAchievements(sessions, stats) {
  return ACHIEVEMENTS.filter((achievement) => achievement.condition(sessions, stats)).map(
    (a) => a.id
  )
}

/**
 * Check for newly unlocked achievements
 * @param {Array} sessions - Array of session objects
 * @param {Object} stats - Current stats object
 * @param {Array} previouslyUnlocked - Array of previously unlocked achievement IDs
 * @returns {Array} Array of newly unlocked achievements
 */
export function getNewAchievements(sessions, stats, previouslyUnlocked = []) {
  const currentlyUnlocked = getUnlockedAchievements(sessions, stats)
  return currentlyUnlocked
    .filter((id) => !previouslyUnlocked.includes(id))
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
}

/**
 * Get achievement progress for display
 * @param {Array} sessions - Array of session objects
 * @param {Object} stats - Current stats object
 * @returns {Array} Array of achievements with progress info
 */
export function getAchievementProgress(sessions, stats) {
  const unlocked = new Set(getUnlockedAchievements(sessions, stats))

  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlocked.has(achievement.id),
  }))
}
