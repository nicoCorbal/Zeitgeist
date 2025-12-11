import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Play, Target, Palette, WifiOff, Sun, Moon, ArrowRight, Timer, BarChart3, Trophy, Check } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const features = [
  {
    icon: Timer,
    title: 'Pomodoro & Libre',
    description: 'Dos modos para adaptarse a tu forma de estudiar. Descansos automáticos o control total.',
  },
  {
    icon: Target,
    title: 'Materias',
    description: 'Organiza tu tiempo por asignaturas. Configura duraciones personalizadas para cada una.',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas',
    description: 'Heatmap de actividad, rachas, horas totales. Visualiza tu progreso real.',
  },
  {
    icon: Trophy,
    title: 'Logros',
    description: '18 logros desbloqueables. Pequeñas victorias que celebran tu constancia.',
  },
  {
    icon: Palette,
    title: '8 Temas',
    description: 'Light, dark, gradientes. Encuentra el ambiente perfecto para concentrarte.',
  },
  {
    icon: WifiOff,
    title: 'Sin conexión',
    description: 'Si se va internet, no pasa nada. Tus datos están en tu dispositivo.',
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative h-full"
      >
        <div className="relative h-full rounded-2xl border border-[var(--border)] bg-[var(--bg)]/80 p-6 backdrop-blur-sm transition-all duration-200 group-hover:border-[var(--text-secondary)]/30">
          <feature.icon
            size={28}
            strokeWidth={1.5}
            className="text-[var(--text)] opacity-80 transition-opacity group-hover:opacity-100"
          />
          <h3 className="mt-5 text-[17px] font-semibold text-[var(--text)]">
            {feature.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-tertiary)]">
            {feature.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Landing({ onEnterApp }) {
  const { setTheme, isDark } = useTheme()

  const toggleLandingTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-x-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[var(--text)] opacity-[0.02] blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[var(--text)] opacity-[0.02] blur-[100px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="Denso"
              className="h-7 w-7"
              style={{ filter: 'var(--logo-filter)' }}
            />
            <span className="text-[17px] font-bold text-[var(--text)]">Denso</span>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleLandingTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            <motion.button
              onClick={onEnterApp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--text)] px-4 py-2 text-[13px] font-medium text-[var(--bg)]"
            >
              Abrir app
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <header className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-3xl text-center">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[clamp(3rem,10vw,5.5rem)] font-bold leading-[1.05] tracking-tight text-[var(--text)]"
          >
            Tu tiempo de estudio,
            <br />
            <span className="text-[var(--text-secondary)]">más <em className="italic">denso</em></span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-8 max-w-lg text-[18px] leading-relaxed text-[var(--text-tertiary)]"
          >
            Temporizador minimalista para estudiantes. Sin distracciones, sin cuentas, sin complicaciones.
          </motion.p>

          {/* Value points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[14px]"
          >
            {['Sin registro', 'Gratis siempre', 'Funciona offline'].map((text) => (
              <span key={text} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Check size={14} strokeWidth={2.5} className="text-[var(--text-secondary)]" />
                {text}
              </span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <motion.button
              onClick={onEnterApp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 rounded-full bg-[var(--text)] px-8 py-4 text-[16px] font-medium text-[var(--bg)] shadow-lg shadow-[var(--text)]/10"
            >
              <Play size={18} fill="currentColor" />
              Empezar ahora
            </motion.button>

            <motion.button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] px-6 py-3.5 text-[15px] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-tertiary)] hover:text-[var(--text)]"
            >
              <ArrowRight size={16} className="-ml-1 rotate-90" />
              Ver cómo funciona
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Video */}
      <section id="demo" className="px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-5xl"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[var(--text)]/5 to-transparent" />

            <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-[var(--bg-secondary)] px-3 py-1 text-center text-[12px] text-[var(--text-tertiary)]">
                  denso.study
                </div>
              </div>

              <div className="aspect-video">
                <video
                  className="h-full w-full"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source src="/cursorful-video-1765473077628.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Características
            </h2>
            <p className="mt-4 text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-[var(--text)]">
              Todo lo que necesitas,<br />nada que no
            </p>
          </motion.div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-bold text-[var(--text)]">
            ¿Listo para enfocarte?
          </h2>
          <p className="mt-4 text-[17px] text-[var(--text-tertiary)]">
            Empieza en segundos. Sin registro, sin configuración.
          </p>

          <motion.button
            onClick={onEnterApp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-8 py-4 text-[15px] font-medium text-[var(--bg)]"
          >
            Comenzar gratis
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-[13px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt=""
              className="h-4 w-4"
              style={{ filter: 'var(--logo-filter)' }}
            />
            <span className="font-bold">Denso</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="transition-colors hover:text-[var(--text-secondary)]">
              Privacidad
            </Link>
            <span>Hecho para estudiantes</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
