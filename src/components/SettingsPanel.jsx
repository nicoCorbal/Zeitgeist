import { useState, useEffect, useId, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Volume2, VolumeX, Clock, Palette, Sparkles, Download, Upload, Database, Focus } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { EmojiPicker } from './EmojiPicker'
import { IconPicker } from './IconPicker'
import { ThemePicker } from './ThemePicker'
import { SoundPicker } from './SoundPicker'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { DURATIONS, EASINGS, staggerContainer } from '../utils/animations'
import { exportData, importData, getDataStats } from '../utils/dataExport'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: DURATIONS.instant
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth }
  }
}

function DataManagementSection() {
  const fileInputRef = useRef(null)
  const [importStatus, setImportStatus] = useState(null)
  const dataStats = getDataStats()

  const handleExport = () => {
    const result = exportData()
    if (!result.success) {
      setImportStatus({ type: 'error', message: 'Error al exportar' })
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await importData(file)
    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `Importado: ${result.stats.sessions} sesiones, ${result.stats.subjects} asignaturas`,
      })
      setTimeout(() => {
        setImportStatus(null)
        window.location.reload() // Reload to apply imported data
      }, 2000)
    } else {
      setImportStatus({ type: 'error', message: result.error || 'Error al importar' })
      setTimeout(() => setImportStatus(null), 3000)
    }

    // Reset input
    e.target.value = ''
  }

  return (
    <motion.section variants={itemVariants} aria-labelledby="data-section">
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <Database size={12} aria-hidden="true" />
        <span id="data-section" className="text-[10px] font-semibold uppercase tracking-widest">
          Datos
        </span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
          <div className="text-lg font-semibold text-[var(--text)]">{dataStats.sessions}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">sesiones</div>
        </div>
        <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
          <div className="text-lg font-semibold text-[var(--text)]">{dataStats.totalHours}h</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">totales</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleExport}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg-secondary)]"
        >
          <Download size={14} aria-hidden="true" />
          Exportar
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg-secondary)]"
        >
          <Upload size={14} aria-hidden="true" />
          Importar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          aria-label="Seleccionar archivo para importar"
        />
      </div>

      {/* Status message */}
      <AnimatePresence>
        {importStatus && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-3 text-center text-[12px] ${
              importStatus.type === 'success' ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {importStatus.message}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">
        Almacenamiento: {dataStats.storageSizeKB} KB
      </p>
    </motion.section>
  )
}

export function SettingsPanel({
  isOpen,
  onClose,
  weeklyGoal,
  onWeeklyGoalChange,
  soundEnabled,
  onSoundToggle,
  soundType,
  onSoundTypeChange,
  currentSubject,
  onSubjectUpdate,
  theme,
  onThemeChange,
  deepFocusEnabled,
  onDeepFocusToggle,
  dailyGoal,
  onDailyGoalChange,
}) {
  const [goalHours, setGoalHours] = useState(Math.round(weeklyGoal / 3600))
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(Math.round(dailyGoal / 60))
  const [workMinutes, setWorkMinutes] = useState(Math.round((currentSubject?.workDuration || 25 * 60) / 60))
  const [breakMinutes, setBreakMinutes] = useState(Math.round((currentSubject?.breakDuration || 5 * 60) / 60))
  const [longBreakMinutes, setLongBreakMinutes] = useState(Math.round((currentSubject?.longBreakDuration || 15 * 60) / 60))
  const [longBreakInterval, setLongBreakIntervalState] = useState(currentSubject?.longBreakInterval ?? 4)

  // Unique IDs for ARIA
  const titleId = useId()
  const goalSliderId = useId()
  const workSliderId = useId()
  const breakSliderId = useId()
  const longBreakSliderId = useId()
  const intervalSliderId = useId()
  const soundToggleId = useId()
  const dailyGoalSliderId = useId()

  // Focus trap for modal
  const panelRef = useFocusTrap(isOpen, onClose)

  useEffect(() => {
    setGoalHours(Math.round(weeklyGoal / 3600))
  }, [weeklyGoal])

  useEffect(() => {
    setDailyGoalMinutes(Math.round(dailyGoal / 60))
  }, [dailyGoal])

  useEffect(() => {
    setWorkMinutes(Math.round((currentSubject?.workDuration || 25 * 60) / 60))
    setBreakMinutes(Math.round((currentSubject?.breakDuration || 5 * 60) / 60))
    setLongBreakMinutes(Math.round((currentSubject?.longBreakDuration || 15 * 60) / 60))
    setLongBreakIntervalState(currentSubject?.longBreakInterval ?? 4)
  }, [currentSubject])

  const handleGoalChange = (hours) => {
    const h = Math.max(1, Math.min(80, hours))
    setGoalHours(h)
    onWeeklyGoalChange(h * 3600)
  }

  const handleDailyGoalChange = (minutes) => {
    const m = Math.max(15, Math.min(480, minutes)) // 15 min to 8 hours
    setDailyGoalMinutes(m)
    onDailyGoalChange(m * 60)
  }

  const handleWorkChange = (minutes) => {
    const m = Math.max(1, Math.min(120, minutes))
    setWorkMinutes(m)
  }

  const handleWorkCommit = () => {
    onSubjectUpdate({ workDuration: workMinutes * 60 })
  }

  const handleBreakChange = (minutes) => {
    const m = Math.max(1, Math.min(30, minutes))
    setBreakMinutes(m)
  }

  const handleBreakCommit = () => {
    onSubjectUpdate({ breakDuration: breakMinutes * 60 })
  }

  const handleLongBreakChange = (minutes) => {
    const m = Math.max(5, Math.min(60, minutes))
    setLongBreakMinutes(m)
  }

  const handleLongBreakCommit = () => {
    onSubjectUpdate({ longBreakDuration: longBreakMinutes * 60 })
  }

  const handleLongBreakIntervalChange = (interval) => {
    const i = Math.max(0, Math.min(10, interval))
    setLongBreakIntervalState(i)
  }

  const handleLongBreakIntervalCommit = () => {
    onSubjectUpdate({ longBreakInterval })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[var(--bg)] shadow-2xl"
            style={{
              paddingTop: 'var(--safe-area-top)',
              paddingRight: 'var(--safe-area-right)',
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4"
            >
              <h2
                id={titleId}
                className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]"
              >
                Ajustes
              </h2>
              <motion.button
                data-close-button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="rounded-full p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                aria-label="Cerrar ajustes"
              >
                <X size={18} aria-hidden="true" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Tema */}
                <motion.section variants={itemVariants} aria-labelledby="theme-section">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Sparkles size={12} aria-hidden="true" />
                    <span id="theme-section" className="text-[10px] font-semibold uppercase tracking-widest">
                      Tema
                    </span>
                  </div>
                  <div className="mt-4">
                    <ThemePicker value={theme} onChange={onThemeChange} />
                  </div>
                </motion.section>

                {/* Metas */}
                <motion.section variants={itemVariants} aria-labelledby="goal-section">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Target size={12} aria-hidden="true" />
                    <span id="goal-section" className="text-[10px] font-semibold uppercase tracking-widest">
                      Metas
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] text-[var(--text-secondary)]">Meta semanal</span>
                      <span className="text-[13px] font-medium tabular-nums text-[var(--text)]" aria-hidden="true">
                        {goalHours}h
                      </span>
                    </div>
                    <label htmlFor={goalSliderId} className="sr-only">
                      Meta de horas semanales
                    </label>
                    <input
                      id={goalSliderId}
                      type="range"
                      min="1"
                      max="60"
                      value={goalHours}
                      onChange={(e) => handleGoalChange(parseInt(e.target.value))}
                      className="h-1 w-full"
                      aria-valuenow={goalHours}
                      aria-valuemin={1}
                      aria-valuemax={60}
                      aria-valuetext={`${goalHours} horas por semana`}
                    />
                  </div>
                  {/* Daily goal sub-section */}
                  <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] text-[var(--text-secondary)]">Meta diaria</span>
                      <span className="text-[13px] font-medium tabular-nums text-[var(--text)]" aria-hidden="true">
                        {dailyGoalMinutes >= 60
                          ? `${Math.floor(dailyGoalMinutes / 60)}h ${dailyGoalMinutes % 60 > 0 ? `${dailyGoalMinutes % 60}m` : ''}`
                          : `${dailyGoalMinutes}m`
                        }
                      </span>
                    </div>
                    <label htmlFor={dailyGoalSliderId} className="sr-only">
                      Meta de minutos diarios
                    </label>
                    <input
                      id={dailyGoalSliderId}
                      type="range"
                      min="15"
                      max="480"
                      step="15"
                      value={dailyGoalMinutes}
                      onChange={(e) => handleDailyGoalChange(parseInt(e.target.value))}
                      className="h-1 w-full"
                      aria-valuenow={dailyGoalMinutes}
                      aria-valuemin={15}
                      aria-valuemax={480}
                      aria-valuetext={`${dailyGoalMinutes} minutos por día`}
                    />
                  </div>
                </motion.section>

                {/* Sonido */}
                <motion.section variants={itemVariants} aria-labelledby="sound-section">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      {soundEnabled ? <Volume2 size={12} aria-hidden="true" /> : <VolumeX size={12} aria-hidden="true" />}
                      <span id="sound-section" className="text-[10px] font-semibold uppercase tracking-widest">
                        Sonido
                      </span>
                    </div>
                    <button
                      id={soundToggleId}
                      role="switch"
                      aria-checked={soundEnabled}
                      aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
                      onClick={onSoundToggle}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        soundEnabled ? 'bg-[var(--text)]' : 'bg-[var(--border)]'
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 h-4 w-4 rounded-full bg-[var(--bg)]"
                        animate={{ left: soundEnabled ? '24px' : '4px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  {soundEnabled && (
                    <div className="mt-4">
                      <SoundPicker value={soundType} onChange={onSoundTypeChange} />
                    </div>
                  )}
                  {!soundEnabled && (
                    <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
                      Notificación sonora al terminar
                    </p>
                  )}
                </motion.section>

                {/* Deep Focus */}
                <motion.section variants={itemVariants} aria-labelledby="deepfocus-section">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Focus size={12} aria-hidden="true" />
                      <span id="deepfocus-section" className="text-[10px] font-semibold uppercase tracking-widest">
                        Deep Focus
                      </span>
                    </div>
                    <button
                      role="switch"
                      aria-checked={deepFocusEnabled}
                      aria-label={deepFocusEnabled ? 'Desactivar deep focus' : 'Activar deep focus'}
                      onClick={onDeepFocusToggle}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        deepFocusEnabled ? 'bg-[var(--text)]' : 'bg-[var(--border)]'
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 h-4 w-4 rounded-full bg-[var(--bg)]"
                        animate={{ left: deepFocusEnabled ? '24px' : '4px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">
                    Modo minimalista que oculta todo durante el focus
                  </p>
                </motion.section>

                {/* Personalización de asignatura */}
                <motion.section variants={itemVariants} aria-labelledby="customize-section">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Palette size={12} aria-hidden="true" />
                    <span id="customize-section" className="text-[10px] font-semibold uppercase tracking-widest">
                      Personalizar · {currentSubject?.name || 'General'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)]">Emoji</span>
                      <div className="mt-2">
                        <EmojiPicker
                          value={currentSubject?.emoji}
                          onChange={(emoji) => onSubjectUpdate({ emoji })}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)]">Color</span>
                      <div className="mt-2">
                        <ColorPicker
                          value={currentSubject?.color}
                          onChange={(color) => onSubjectUpdate({ color })}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)]">Icono</span>
                      <div className="mt-2">
                        <IconPicker
                          value={currentSubject?.icon}
                          onChange={(icon) => onSubjectUpdate({ icon })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Pomodoro tiempos por asignatura */}
                <motion.section variants={itemVariants} aria-labelledby="times-section">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock size={12} aria-hidden="true" />
                    <span id="times-section" className="text-[10px] font-semibold uppercase tracking-widest">
                      Tiempos · {currentSubject?.name || 'General'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {/* Work duration */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor={workSliderId} className="text-[13px] text-[var(--text-secondary)]">
                          Focus
                        </label>
                        <span className="text-[13px] font-medium tabular-nums text-[var(--text)]" aria-hidden="true">
                          {workMinutes} min
                        </span>
                      </div>
                      <input
                        id={workSliderId}
                        type="range"
                        min="1"
                        max="120"
                        value={workMinutes}
                        onChange={(e) => handleWorkChange(parseInt(e.target.value))}
                        onMouseUp={handleWorkCommit}
                        onTouchEnd={handleWorkCommit}
                        className="h-1 w-full"
                        aria-valuenow={workMinutes}
                        aria-valuemin={1}
                        aria-valuemax={120}
                        aria-valuetext={`${workMinutes} minutos de focus`}
                      />
                    </div>

                    {/* Break duration */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor={breakSliderId} className="text-[13px] text-[var(--text-secondary)]">
                          Descanso
                        </label>
                        <span className="text-[13px] font-medium tabular-nums text-[var(--text)]" aria-hidden="true">
                          {breakMinutes} min
                        </span>
                      </div>
                      <input
                        id={breakSliderId}
                        type="range"
                        min="1"
                        max="30"
                        value={breakMinutes}
                        onChange={(e) => handleBreakChange(parseInt(e.target.value))}
                        onMouseUp={handleBreakCommit}
                        onTouchEnd={handleBreakCommit}
                        className="h-1 w-full"
                        aria-valuenow={breakMinutes}
                        aria-valuemin={1}
                        aria-valuemax={30}
                        aria-valuetext={`${breakMinutes} minutos de descanso`}
                      />
                    </div>

                    {/* Long break duration */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor={longBreakSliderId} className="text-[13px] text-[var(--text-secondary)]">
                          Descanso largo
                        </label>
                        <span className="text-[13px] font-medium tabular-nums text-[var(--text)]" aria-hidden="true">
                          {longBreakMinutes} min
                        </span>
                      </div>
                      <input
                        id={longBreakSliderId}
                        type="range"
                        min="5"
                        max="60"
                        value={longBreakMinutes}
                        onChange={(e) => handleLongBreakChange(parseInt(e.target.value))}
                        onMouseUp={handleLongBreakCommit}
                        onTouchEnd={handleLongBreakCommit}
                        className="h-1 w-full"
                        aria-valuenow={longBreakMinutes}
                        aria-valuemin={5}
                        aria-valuemax={60}
                        aria-valuetext={`${longBreakMinutes} minutos de descanso largo`}
                      />
                    </div>

                    {/* Long break interval */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor={intervalSliderId} className="text-[13px] text-[var(--text-secondary)]">
                          Cada
                        </label>
                        <span className="text-[13px] font-medium tabular-nums text-[var(--text)]" aria-hidden="true">
                          {longBreakInterval === 0 ? 'Nunca' : `${longBreakInterval} pomodoros`}
                        </span>
                      </div>
                      <input
                        id={intervalSliderId}
                        type="range"
                        min="0"
                        max="10"
                        value={longBreakInterval}
                        onChange={(e) => handleLongBreakIntervalChange(parseInt(e.target.value))}
                        onMouseUp={handleLongBreakIntervalCommit}
                        onTouchEnd={handleLongBreakIntervalCommit}
                        className="h-1 w-full"
                        aria-valuenow={longBreakInterval}
                        aria-valuemin={0}
                        aria-valuemax={10}
                        aria-valuetext={longBreakInterval === 0 ? 'Nunca' : `Cada ${longBreakInterval} pomodoros`}
                      />
                    </div>
                  </div>
                </motion.section>

                {/* Keyboard shortcuts */}
                <motion.section variants={itemVariants} aria-labelledby="shortcuts-section">
                  <span id="shortcuts-section" className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Atajos de teclado
                  </span>
                  <dl className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <dt className="text-[var(--text-secondary)]">Play / Pausa</dt>
                      <dd>
                        <kbd className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                          espacio
                        </kbd>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <dt className="text-[var(--text-secondary)]">Reiniciar</dt>
                      <dd>
                        <kbd className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                          R
                        </kbd>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <dt className="text-[var(--text-secondary)]">Saltar break</dt>
                      <dd>
                        <kbd className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                          S
                        </kbd>
                      </dd>
                    </div>
                  </dl>
                </motion.section>

                {/* Data management */}
                <DataManagementSection />
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-[var(--border)] px-6 py-4"
              style={{ paddingBottom: 'max(16px, var(--safe-area-bottom))' }}
            >
              <p className="text-center text-[11px] text-[var(--text-tertiary)]">
                Zeitgeist v1.0
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
