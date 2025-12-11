import { motion } from 'framer-motion'
import { Zap, Clock, Calendar, TrendingUp } from 'lucide-react'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const ENERGY_LABELS = {
  low: { emoji: '😴', label: 'Bajo' },
  normal: { emoji: '😐', label: 'Normal' },
  high: { emoji: '⚡', label: 'Alto' },
}

const FLOW_LABELS = {
  1: '😤 Difícil',
  2: '😐 Normal',
  3: '🔥 Flow',
}

export function EnergyInsights({ insights }) {
  if (!insights || insights.totalSessionsWithData < 3) {
    return (
      <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Zap size={14} />
          <span className="text-[12px] font-medium">Energy Insights</span>
        </div>
        <p className="mt-3 text-[13px] text-[var(--text-tertiary)]">
          Completa al menos 3 sesiones con datos de energía para ver tus insights personalizados.
        </p>
        <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
          {insights?.totalSessionsWithData || 0}/3 sesiones registradas
        </p>
      </div>
    )
  }

  const { avgFlowByEnergy, bestHour, bestDay, energyDistribution } = insights

  // Find best energy level
  let bestEnergy = null
  let bestEnergyFlow = 0
  Object.entries(avgFlowByEnergy).forEach(([energy, flow]) => {
    if (flow > bestEnergyFlow) {
      bestEnergyFlow = flow
      bestEnergy = energy
    }
  })

  // Calculate productivity multiplier for high energy
  const lowFlow = avgFlowByEnergy.low || 1.5
  const highFlow = avgFlowByEnergy.high || 2
  const multiplier = (highFlow / lowFlow).toFixed(1)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <Zap size={14} />
        <span className="text-[12px] font-medium">Energy Insights</span>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">
          {insights.totalSessionsWithData} sesiones
        </span>
      </div>

      {/* Main insight */}
      {bestEnergy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[var(--bg-secondary)] p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{ENERGY_LABELS[bestEnergy]?.emoji}</span>
            <div>
              <p className="text-[13px] font-medium text-[var(--text)]">
                Rindes mejor con energía {ENERGY_LABELS[bestEnergy]?.label.toLowerCase()}
              </p>
              {parseFloat(multiplier) > 1.2 && (
                <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                  <TrendingUp size={12} className="mr-1 inline" />
                  {multiplier}x más productivo que con energía baja
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Best time */}
      <div className="grid grid-cols-2 gap-3">
        {bestHour !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-[var(--bg-secondary)] p-3"
          >
            <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
              <Clock size={12} />
              <span className="text-[10px] uppercase tracking-wider">Mejor hora</span>
            </div>
            <p className="mt-2 text-[18px] font-semibold tabular-nums text-[var(--text)]">
              {bestHour}:00
            </p>
          </motion.div>
        )}

        {bestDay !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl bg-[var(--bg-secondary)] p-3"
          >
            <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
              <Calendar size={12} />
              <span className="text-[10px] uppercase tracking-wider">Mejor día</span>
            </div>
            <p className="mt-2 text-[18px] font-semibold text-[var(--text)]">
              {DAYS[bestDay]}
            </p>
          </motion.div>
        )}
      </div>

      {/* Energy distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-[var(--bg-secondary)] p-3"
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
          Distribución de energía (semana)
        </p>
        <div className="mt-3 flex items-center gap-3">
          {Object.entries(energyDistribution).map(([energy, count]) => (
            <div key={energy} className="flex items-center gap-1.5">
              <span className="text-base">{ENERGY_LABELS[energy]?.emoji}</span>
              <span className="text-[13px] font-medium tabular-nums text-[var(--text)]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Flow by energy breakdown */}
      {Object.keys(avgFlowByEnergy).length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl bg-[var(--bg-secondary)] p-3"
        >
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Flow promedio por energía
          </p>
          <div className="mt-3 space-y-2">
            {Object.entries(avgFlowByEnergy).map(([energy, flow]) => (
              <div key={energy} className="flex items-center gap-2">
                <span className="w-5 text-center">{ENERGY_LABELS[energy]?.emoji}</span>
                <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(flow / 3) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-full bg-[var(--text-tertiary)] rounded-full"
                  />
                </div>
                <span className="w-12 text-right text-[11px] tabular-nums text-[var(--text-secondary)]">
                  {flow.toFixed(1)}/3
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
