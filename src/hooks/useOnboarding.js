import { useLocalStorage } from './useLocalStorage'

/**
 * Hook to manage onboarding state
 * Returns whether onboarding should be shown and function to complete it
 */
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage(
    'zeitgeist-onboarding-complete',
    false
  )

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true)
  }

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false)
  }

  return {
    showOnboarding: !hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
  }
}
