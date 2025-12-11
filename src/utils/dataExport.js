/**
 * Data export/import utilities for Zeitgeist
 * Allows users to backup and restore their data
 */

// Keys to export from localStorage
const EXPORT_KEYS = [
  'zeitgeist-sessions',
  'zeitgeist-subjects',
  'zeitgeist-weekly-goal',
  'zeitgeist-sound',
  'zeitgeist-sound-type',
  'zeitgeist-theme',
]

/**
 * Export all user data as a JSON file
 * @returns {void}
 */
export function exportData() {
  try {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {},
    }

    // Collect data from all keys
    EXPORT_KEYS.forEach((key) => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          data.data[key] = JSON.parse(value)
        } catch {
          data.data[key] = value
        }
      }
    })

    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zeitgeist-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('[Export] Failed to export data:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Import data from a JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<{success: boolean, error?: string, stats?: object}>}
 */
export async function importData(file) {
  try {
    const text = await file.text()
    const imported = JSON.parse(text)

    // Validate structure
    if (!imported.version || !imported.data) {
      throw new Error('Formato de archivo inválido')
    }

    // Count what we're importing
    const stats = {
      sessions: 0,
      subjects: 0,
      settings: 0,
    }

    // Import each key
    Object.entries(imported.data).forEach(([key, value]) => {
      if (EXPORT_KEYS.includes(key)) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
        localStorage.setItem(key, stringValue)

        // Count items
        if (key === 'zeitgeist-sessions' && Array.isArray(value)) {
          stats.sessions = value.length
        } else if (key === 'zeitgeist-subjects' && Array.isArray(value)) {
          stats.subjects = value.length
        } else {
          stats.settings++
        }
      }
    })

    return { success: true, stats }
  } catch (error) {
    console.error('[Import] Failed to import data:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get statistics about stored data
 * @returns {object}
 */
export function getDataStats() {
  try {
    const sessions = JSON.parse(localStorage.getItem('zeitgeist-sessions') || '[]')
    const subjects = JSON.parse(localStorage.getItem('zeitgeist-subjects') || '[]')

    // Calculate total time
    const totalSeconds = sessions.reduce((acc, session) => acc + (session.duration || 0), 0)

    // Calculate storage size (approximate)
    let storageSize = 0
    EXPORT_KEYS.forEach((key) => {
      const value = localStorage.getItem(key)
      if (value) {
        storageSize += value.length * 2 // UTF-16 characters = 2 bytes each
      }
    })

    return {
      sessions: sessions.length,
      subjects: subjects.length,
      totalHours: Math.round(totalSeconds / 3600 * 10) / 10,
      storageSizeKB: Math.round(storageSize / 1024 * 10) / 10,
      oldestSession: sessions.length > 0 ? sessions[0].date : null,
      newestSession: sessions.length > 0 ? sessions[sessions.length - 1].date : null,
    }
  } catch (error) {
    console.error('[Stats] Failed to get data stats:', error)
    return {
      sessions: 0,
      subjects: 0,
      totalHours: 0,
      storageSizeKB: 0,
    }
  }
}

/**
 * Clear all app data (with confirmation)
 * @returns {boolean}
 */
export function clearAllData() {
  try {
    EXPORT_KEYS.forEach((key) => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('[Clear] Failed to clear data:', error)
    return false
  }
}
