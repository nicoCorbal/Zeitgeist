# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Denso is a premium study timer PWA built with React 19 and Vite. It supports Pomodoro technique and free timer modes, with subject-based task tracking, 8 themes, haptic feedback, achievements system, and offline support.

## Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (code-split for performance)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

### State Management

All persistent state uses localStorage via the `useLocalStorage` hook. Key storage keys:
- `denso-sessions` - Array of completed study sessions
- `denso-subjects` - Array of subjects with their todos, durations, and settings
- `denso-theme` - Current theme ID
- `denso-weekly-goal` - Weekly study goal in seconds
- `denso-sound` / `denso-sound-type` - Sound preferences

### Core Hooks (src/hooks/)

- **useTimer.js** - Timer logic for both Pomodoro and free modes. Uses real timestamps (not intervals) for accuracy. Handles work/break phases, long break intervals, pause/resume.
- **useStats.js** - Session tracking, subject CRUD, todo management, streak calculation. Contains `migrateSubject()` for backwards compatibility when adding new subject fields.
- **useTheme.js** - Theme management via CSS custom properties on document root.
- **useNotification.js** - Browser notifications and sound playback.
- **useHaptics.js** - Vibration API patterns for tactile feedback (mobile).
- **useFocusTrap.js** - Keyboard focus management for modals (WCAG compliance).
- **useLocalStorage.js** - Enhanced storage with quota detection, private mode handling, cross-tab sync.
- **useOnlineStatus.js** - Connectivity detection for offline mode.

### Timer Modes

1. **Pomodoro** - Countdown timer with configurable work/break durations per subject. Tracks phases ('work'/'break') and handles long breaks at configurable intervals.
2. **Free** - Count-up timer. Sessions can be saved manually when stopped (minimum 60 seconds).

### Data Structures

Subjects have configurable durations (stored in seconds):
- `workDuration` (default 25*60)
- `breakDuration` (default 5*60)
- `longBreakDuration` (default 15*60)
- `longBreakInterval` (default 4)

### Theming

Themes are defined in `src/data/themes.js`. The app applies CSS custom properties (`--bg`, `--text`, `--border`, etc.) to the document root.

### Key Components

- **ErrorBoundary.jsx** - Crash recovery with elegant fallback UI
- **Confetti.jsx** - Celebration animations (particles, pulse ring, success check)
- **ActivityHeatmap.jsx** - GitHub-style contribution graph for study activity
- **AchievementsPanel.jsx** - Gamification system with 18 unlockable achievements
- **OfflineBanner.jsx** - Connectivity status indicator

### Premium Features

- **Haptic Feedback** - Vibration patterns for interactions (mobile devices)
- **Sound System** - Web Audio API with ADSR envelopes and harmonics
- **Data Export/Import** - Backup and restore via JSON files
- **Activity Heatmap** - Visual history of study patterns
- **Achievements** - 18 achievements across sessions, streaks, and hours milestones
- **PWA Support** - Service worker, manifest, installable on mobile/desktop
- **Offline Mode** - Full functionality without internet connection

### Animation Constants

`src/utils/animations.js` contains standardized animation values:
- `DURATIONS` - Timing (fast, normal, slow)
- `EASINGS` - Cubic bezier curves
- `SPRINGS` - Framer Motion spring configs
- `VARIANTS` - Reusable animation variants

### Accessibility (WCAG 2.1 AA)

- All interactive elements have ARIA labels
- Focus trap in modals
- `prefers-reduced-motion` respected
- Keyboard shortcuts (Space, R, S)
- Skip link for main content

### UI Notes

- Framer Motion for animations
- Focus mode (Pomodoro work phase) minimizes UI and enlarges timer
- Tailwind CSS v4 with Vite plugin
- Code-split via React.lazy for StatsPanel and SettingsPanel
- Safe area insets for mobile notches/Dynamic Island
- Language: Spanish (UI text is in Spanish)
