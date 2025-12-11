/**
 * Achievement definitions for Denso
 * Gamification system to encourage consistent study habits
 */

export const ACHIEVEMENTS = [
  // Session milestones
  {
    id: 'first_session',
    name: 'Primera sesión',
    description: 'Completa tu primera sesión de estudio',
    icon: 'rocket',
    condition: (sessions) => sessions.length >= 1,
  },
  {
    id: 'sessions_10',
    name: 'En racha',
    description: 'Completa 10 sesiones de estudio',
    icon: 'zap',
    condition: (sessions) => sessions.length >= 10,
  },
  {
    id: 'sessions_50',
    name: 'Dedicado',
    description: 'Completa 50 sesiones de estudio',
    icon: 'star',
    condition: (sessions) => sessions.length >= 50,
  },
  {
    id: 'sessions_100',
    name: 'Centurión',
    description: 'Completa 100 sesiones de estudio',
    icon: 'trophy',
    condition: (sessions) => sessions.length >= 100,
  },
  {
    id: 'sessions_500',
    name: 'Leyenda',
    description: 'Completa 500 sesiones de estudio',
    icon: 'crown',
    condition: (sessions) => sessions.length >= 500,
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'Constante',
    description: 'Mantén una racha de 3 días',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Semana perfecta',
    description: 'Mantén una racha de 7 días',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Imparable',
    description: 'Mantén una racha de 30 días',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 30,
  },
  {
    id: 'streak_100',
    name: 'Máquina',
    description: 'Mantén una racha de 100 días',
    icon: 'flame',
    condition: (_, stats) => stats.streak >= 100,
  },

  // Hour milestones
  {
    id: 'hours_10',
    name: 'Maratonista',
    description: 'Acumula 10 horas de estudio',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 10,
  },
  {
    id: 'hours_50',
    name: 'Estudioso',
    description: 'Acumula 50 horas de estudio',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 50,
  },
  {
    id: 'hours_100',
    name: 'Centenario',
    description: 'Acumula 100 horas de estudio',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 100,
  },
  {
    id: 'hours_500',
    name: 'Maestro',
    description: 'Acumula 500 horas de estudio',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 500,
  },
  {
    id: 'hours_1000',
    name: 'Experto',
    description: 'Acumula 1000 horas de estudio',
    icon: 'clock',
    condition: (sessions) => getTotalHours(sessions) >= 1000,
  },

  // Special achievements
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Estudia antes de las 7:00 AM',
    icon: 'sun',
    condition: (sessions) =>
      sessions.some((s) => {
        const hour = new Date(s.date).getHours()
        return hour < 7
      }),
  },
  {
    id: 'night_owl',
    name: 'Noctámbulo',
    description: 'Estudia después de las 11:00 PM',
    icon: 'moon',
    condition: (sessions) =>
      sessions.some((s) => {
        const hour = new Date(s.date).getHours()
        return hour >= 23
      }),
  },
  {
    id: 'weekend_warrior',
    name: 'Guerrero de fin de semana',
    description: 'Estudia un sábado y un domingo',
    icon: 'calendar',
    condition: (sessions) => {
      let saturday = false
      let sunday = false
      sessions.forEach((s) => {
        const day = new Date(s.date).getDay()
        if (day === 6) saturday = true
        if (day === 0) sunday = true
      })
      return saturday && sunday
    },
  },
  {
    id: 'long_session',
    name: 'Inmersión profunda',
    description: 'Completa una sesión de 2+ horas',
    icon: 'target',
    condition: (sessions) => sessions.some((s) => s.duration >= 7200),
  },
  {
    id: 'diverse',
    name: 'Versátil',
    description: 'Estudia 5 asignaturas diferentes',
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
