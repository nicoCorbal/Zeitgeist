import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Play, Clock, Target, Zap, Palette, WifiOff, Sun, Moon, ArrowRight, Sparkles } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const features = [
  {
    icon: Clock,
    title: 'Dos modos de timer',
    description: 'Pomodoro con descansos automáticos o temporizador libre',
  },
  {
    icon: Target,
    title: 'Seguimiento por materias',
    description: 'Organiza tu tiempo y visualiza tu progreso',
  },
  {
    icon: Zap,
    title: 'Sistema de logros',
    description: '18 logros que celebran tu progreso',
  },
  {
    icon: Palette,
    title: '8 temas',
    description: 'Encuentra tu estilo perfecto',
  },
  {
    icon: WifiOff,
    title: '100% offline',
    description: 'Tus datos nunca salen de tu dispositivo',
  },
  {
    icon: Sparkles,
    title: 'Estadísticas',
    description: 'Heatmap, rachas y progreso semanal',
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group cursor-default"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--border)] p-6 transition-all duration-500 hover:border-[var(--text-tertiary)] hover:shadow-lg">
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-secondary)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--text)] group-hover:text-[var(--bg)]">
            <feature.icon size={22} strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-[var(--text)]">
            {feature.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-tertiary)]">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function Landing({ onEnterApp }) {
  const { toggle, isDark } = useTheme()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Denso"
              className="h-7 w-7"
              style={{ filter: 'var(--logo-filter)' }}
            />
            <span className="font-semibold text-[var(--text)]">Denso</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            <motion.button
              onClick={onEnterApp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
            >
              Abrir app
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.header
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <div className="max-w-4xl">
          {/* Logo */}
          <motion.img
            src="/logo.svg"
            alt=""
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto h-16 w-16 sm:h-20 sm:w-20"
            style={{ filter: 'var(--logo-filter)' }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-6xl font-bold tracking-tight text-[var(--text)] sm:text-7xl lg:text-8xl"
          >
            Haz tu tiempo
            <br />
            más denso
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mx-auto mt-8 max-w-lg text-xl text-[var(--text-secondary)] sm:text-2xl"
          >
            Temporizador de estudio minimalista.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center"
          >
            <motion.button
              onClick={onEnterApp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-full bg-[var(--text)] px-10 py-5 text-lg font-medium text-[var(--bg)]"
            >
              <Play size={20} fill="currentColor" />
              Empezar ahora
            </motion.button>

            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[var(--text-secondary)] underline-offset-4 hover:underline"
            >
              Ver demo
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-sm text-[var(--text-tertiary)]"
          >
            Gratis · Sin registro · Offline
          </motion.p>
        </div>

        {/* Scroll line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 w-[1px] bg-[var(--border)]"
          />
        </motion.div>
      </motion.header>

      {/* Video */}
      <section id="demo" className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            {/* Browser bar */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-tertiary)] opacity-40" />
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-tertiary)] opacity-40" />
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-tertiary)] opacity-40" />
              </div>
              <div className="ml-3 flex-1 rounded bg-[var(--bg)] px-3 py-1 text-center text-xs text-[var(--text-tertiary)]">
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
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
              Simple pero completo
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl text-center"
        >
          <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
            ¿Listo para empezar?
          </h2>
          <p className="mt-4 text-[var(--text-secondary)]">
            Gratis para siempre. Sin registro. Tus datos son tuyos.
          </p>

          <motion.button
            onClick={onEnterApp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-8 py-4 font-medium text-[var(--bg)]"
          >
            Comenzar
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-sm text-[var(--text-tertiary)]">
          <span>Denso</span>
          <span>© 2025</span>
        </div>
      </footer>
    </div>
  )
}
