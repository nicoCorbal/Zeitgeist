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

    // Color sólido para modales/dropdowns (siempre opaco)
    root.style.setProperty('--bg-solid', theme.colors.bg)
    // Color elevado para dropdowns (más claro/visible)
    root.style.setProperty('--bg-elevated', theme.colors.bgSecondary)

    // Fondo especial (gradiente, etc.)
    if (theme.colors.bgSpecial) {
      document.body.style.background = theme.colors.bgSpecial
      document.body.style.backgroundAttachment = 'fixed'
      root.style.setProperty('--bg-app', 'transparent')
    } else {
      document.body.style.background = theme.colors.bg
      document.body.style.backgroundAttachment = ''
      root.style.setProperty('--bg-app', theme.colors.bg)
    }

    // Logo filter - invertir en temas oscuros
    const darkThemes = ['dark', 'nord', 'ember', 'ocean']
    root.style.setProperty('--logo-filter', darkThemes.includes(themeId) ? 'invert(1)' : 'none')

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
    const darkThemes = ['dark', 'nord', 'ember', 'ocean']
    const isDark = darkThemes.includes(themeId)
    setThemeId(isDark ? 'light' : 'dark')
  }

  const isDark = ['dark', 'nord', 'ember', 'ocean'].includes(themeId)

  return { theme: themeId, setTheme, toggle, isDark }
}
