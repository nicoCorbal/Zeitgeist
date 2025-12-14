# Plan de Correcciones - Denso

## Fase 1: Bugs Críticos (Alta prioridad)

### 1.1 Confetti.jsx - Math.random() impuro
- **Problema**: `Math.random()` en animaciones causa valores inconsistentes
- **Solución**: Pre-generar valores aleatorios en `generateParticles()`
- **Líneas**: 41-42

### 1.2 useCalendar.js - ID undefined
- **Problema**: `expandEvent` puede retornar `id: undefined`
- **Solución**: Añadir fallback `id: e.i || e.id || 'unknown'`
- **Línea**: 17

### 1.3 useStats.js - Race condition
- **Problema**: Al eliminar subject, accede a `subjects[0]` que puede no existir
- **Solución**: Usar el callback de `setSubjects` para obtener el nuevo array
- **Líneas**: 102-104

### 1.4 useOnlineStatus.js - Re-suscripción constante
- **Problema**: Dependency `[isOnline]` causa que listeners se re-agreguen
- **Solución**: Cambiar a `[]` (empty dependency array)
- **Línea**: 35

### 1.5 App.jsx - Dependency arrays incorrectos
- **Problema**: `timer` falta en dependencies de `handleToggle` y keyboard effect
- **Solución**: Añadir `timer` a los dependency arrays
- **Líneas**: 164, 187

---

## Fase 2: Problemas de Lógica (Media prioridad)

### 2.1 App.jsx - Cambio de subject durante timer
- **Problema**: `workDuration` puede cambiar mientras timer corre
- **Solución**: Guardar `workDuration` al iniciar sesión, no recalcular
- **Líneas**: 144-148

### 2.2 ActivityHeatmap.jsx - Timezone y null checks
- **Problema**: `session.date?.split('T')[0]` puede fallar
- **Solución**: Validar formato de fecha antes de procesar
- **Líneas**: 49, 88

### 2.3 achievements.js - Dates sin validación
- **Problema**: `new Date(s.date)` puede ser Invalid Date
- **Solución**: Añadir validación `isValidDate()` helper
- **Líneas**: 119, 143

### 2.4 Confetti.jsx - Fast Refresh violation
- **Problema**: Hook `useCelebration` exportado con componentes
- **Solución**: Mover `useCelebration` a `src/hooks/useCelebration.js`

### 2.5 EventForm.jsx - setState múltiple en effect
- **Problema**: 7 llamadas a setState en un effect
- **Solución**: Usar un solo objeto de estado o batch con `flushSync` (React 18+)
- **Líneas**: 23-33

---

## Fase 3: Cleanup (Baja prioridad)

### 3.1 Imports no utilizados (18 archivos)
Remover `motion` del import donde no se usa:
- App.jsx
- AchievementToast.jsx
- AchievementsPanel.jsx
- ActivityHeatmap.jsx
- CalendarGrid.jsx
- CalendarPanel.jsx
- Confetti.jsx
- EmojiPicker.jsx
- EventForm.jsx
- Landing.jsx
- ModeToggle.jsx
- OfflineBanner.jsx
- Onboarding.jsx
- SettingsPanel.jsx
- SoundPicker.jsx
- StatsPanel.jsx
- ThemePicker.jsx
- TimerControls.jsx
- TimerDisplay.jsx
- Toast.jsx
- TodoItem.jsx
- TodoList.jsx

### 3.2 Variables no utilizadas
- `Privacy.jsx:6` - Remover `isDark`
- `SettingsPanel.jsx:8` - Remover `staggerContainer`
- `useCalendar.js:87` - Variable `c` (ignorar con `_c`)

### 3.3 Estilos hardcoded
- `Onboarding.jsx:131` - Cambiar `amber-600` por variable CSS

### 3.4 Null checks faltantes
- `App.jsx:884` - Añadir `subjectToDelete?.emoji`

---

## Orden de ejecución

```
Fase 1 (Críticos)     → 30 min
├── 1.1 Confetti
├── 1.2 useCalendar
├── 1.3 useStats
├── 1.4 useOnlineStatus
└── 1.5 App.jsx deps

Fase 2 (Lógica)       → 45 min
├── 2.1 Timer/subject sync
├── 2.2 ActivityHeatmap
├── 2.3 achievements
├── 2.4 useCelebration extract
└── 2.5 EventForm batch

Fase 3 (Cleanup)      → 20 min
├── 3.1 Imports (bulk)
├── 3.2 Variables
├── 3.3 Estilos
└── 3.4 Null checks

Build + Test          → 10 min
Commit + Push         → 5 min
```

---

## Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/Confetti.jsx` | 1.1, 2.4, 3.1 |
| `src/hooks/useCalendar.js` | 1.2, 3.2 |
| `src/hooks/useStats.js` | 1.3 |
| `src/hooks/useOnlineStatus.js` | 1.4 |
| `src/App.jsx` | 1.5, 2.1, 3.1, 3.4 |
| `src/components/ActivityHeatmap.jsx` | 2.2, 3.1 |
| `src/data/achievements.js` | 2.3 |
| `src/components/EventForm.jsx` | 2.5, 3.1 |
| `src/hooks/useCelebration.js` | 2.4 (NUEVO) |
| `src/components/Privacy.jsx` | 3.2 |
| `src/components/SettingsPanel.jsx` | 3.1, 3.2 |
| `src/components/Onboarding.jsx` | 3.1, 3.3 |
| +16 archivos más | 3.1 (imports) |

**Total: ~25 archivos**
