import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getUnlockedAchievements, getNewAchievements, ACHIEVEMENTS } from '../data/achievements'

/**
 * Hook to manage achievements and detect new unlocks
 */
export function useAchievements(sessions, stats) {
  const [unlockedIds, setUnlockedIds] = useLocalStorage('denso-achievements', [])
  const [newAchievement, setNewAchievement] = useState(null)
  const [showAchievementToast, setShowAchievementToast] = useState(false)

  // Check for new achievements when sessions or stats change
  useEffect(() => {
    if (!sessions || !stats) return

    const currentUnlocked = getUnlockedAchievements(sessions, stats)
    const newOnes = getNewAchievements(sessions, stats, unlockedIds)

    // If there are new achievements, show the first one
    if (newOnes.length > 0) {
      setNewAchievement(newOnes[0])
      setShowAchievementToast(true)
      // Update stored unlocked achievements
      setUnlockedIds(currentUnlocked)
    }
  }, [sessions, stats, unlockedIds, setUnlockedIds])

  // Dismiss the toast
  const dismissAchievement = useCallback(() => {
    setShowAchievementToast(false)
    // After animation, check if there are more to show
    setTimeout(() => {
      setNewAchievement(null)
    }, 300)
  }, [])

  // Get all achievements with their unlock status
  const getAllAchievements = useCallback(() => {
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedIds.includes(a.id),
    }))
  }, [unlockedIds])

  return {
    newAchievement,
    showAchievementToast,
    dismissAchievement,
    getAllAchievements,
    unlockedCount: unlockedIds.length,
    totalCount: ACHIEVEMENTS.length,
  }
}
