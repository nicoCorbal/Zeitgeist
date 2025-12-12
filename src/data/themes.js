export const THEMES = {
  // 1. Blanco puro, minimalista (default light)
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#f5f5f5',
      text: '#171717',
      textSecondary: '#525252',
      textTertiary: '#737373',
      border: '#e5e5e5',
      borderLight: '#f0f0f0',
    }
  },

  // 2. Negro OLED puro (default dark)
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      bg: '#000000',
      bgSecondary: '#0a0a0a',
      text: '#fafafa',
      textSecondary: '#a1a1a1',
      textTertiary: '#8a8a8a',
      border: '#1a1a1a',
      borderLight: '#0f0f0f',
    }
  },

  // 3. Sepia cálido, como un libro
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    colors: {
      bg: '#f5f0e6',
      bgSecondary: '#ebe4d6',
      text: '#3d3227',
      textSecondary: '#6b5d4d',
      textTertiary: '#756859',
      border: '#ddd4c4',
      borderLight: '#e8e0d2',
    }
  },

  // 4. Nord - Azul ártico frío
  nord: {
    id: 'nord',
    name: 'Nord',
    colors: {
      bg: '#2e3440',
      bgSecondary: '#3b4252',
      text: '#eceff4',
      textSecondary: '#d8dee9',
      textTertiary: '#9aa5b8',
      border: '#434c5e',
      borderLight: '#3b4252',
    }
  },

  // 5. Verde natural relajante
  sage: {
    id: 'sage',
    name: 'Sage',
    colors: {
      bg: '#f4f7f4',
      bgSecondary: '#e8ede8',
      text: '#2d3a2d',
      textSecondary: '#4a5f4a',
      textTertiary: '#5c725c',
      border: '#d4ddd4',
      borderLight: '#e0e8e0',
    }
  },

  // 6. Cálido y energético
  ember: {
    id: 'ember',
    name: 'Ember',
    colors: {
      bg: '#1a1416',
      bgSecondary: '#241c1e',
      text: '#f5ebe8',
      textSecondary: '#d4a59a',
      textTertiary: '#b08a80',
      border: '#3a2c2e',
      borderLight: '#2a2022',
    }
  },

  // 7. Azul profundo con gradiente sutil
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      bg: '#0c1220',
      bgSecondary: '#121a2a',
      text: '#e8eef4',
      textSecondary: '#8a9bb4',
      textTertiary: '#8899aa',
      border: '#1a2535',
      borderLight: '#151d2a',
      bgSpecial: 'radial-gradient(ellipse at 50% 100%, #0a1828 0%, #0c1220 60%)',
    }
  },

  // 8. Gradiente suave claro (especial)
  cloud: {
    id: 'cloud',
    name: 'Cloud',
    colors: {
      bg: '#f0f2f5',
      bgSecondary: '#e4e7ec',
      text: '#1f2937',
      textSecondary: '#4b5563',
      textTertiary: '#5f6672',
      border: '#d1d5db',
      borderLight: '#e5e7eb',
      bgSpecial: 'linear-gradient(135deg, #f0f2f5 0%, #e8eaf0 40%, #f2f0f5 100%)',
    }
  },
}

export const THEME_LIST = Object.values(THEMES)
