import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { THEMES } from '../data/themes'

export function useTheme() {
  const [themeId, setThemeId] = useLocalStorage('denso-theme', 'light')

  useEffect(() => {
    const theme = THEMES[themeId] || THEMES.light
    const root = document.documentElement

    // Aplicar variables CSS
    root.style.setProperty('--bg', theme.colors.bg)
    root.style.setProperty('--bg-secondary', theme.colors.bgSecondary)
    root.style.setProperty('--text', theme.colors.text)
    root.style.setProperty('--text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--text-tertiary', theme.colors.textTertiary)
    root.style.setProperty('--border', theme.colors.border)
    root.style.setProperty('--border-light', theme.colors.borderLight)

    // Para compatibilidad con código existente
    root.setAttribute('data-theme', themeId)
  }, [themeId])

  const setTheme = (id) => {
    if (THEMES[id]) {
      setThemeId(id)
    }
  }

  // Toggle rápido light/dark
  const toggle = () => {
    const darkThemes = ['dark', 'midnight']
    const isDark = darkThemes.includes(themeId)
    setThemeId(isDark ? 'light' : 'dark')
  }

  const isDark = ['dark', 'midnight'].includes(themeId)

  return { theme: themeId, setTheme, toggle, isDark }
}
