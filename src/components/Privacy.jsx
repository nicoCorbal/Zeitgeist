import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function Privacy() {

  return (
    <div className="min-h-screen bg-[var(--bg)] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/landing"
          className="inline-flex items-center gap-2 text-[14px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        <h1 className="mt-8 text-[32px] font-bold text-[var(--text)]">
          Privacidad
        </h1>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <p>
            <strong className="text-[var(--text)]">Denso no recopila ningún dato personal.</strong>
          </p>

          <p>
            Toda la información que generas al usar la aplicación (sesiones de estudio,
            materias, tareas, ajustes y preferencias) se guarda exclusivamente en el
            almacenamiento local de tu navegador (localStorage).
          </p>

          <p>
            Esto significa que:
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>Tus datos nunca salen de tu dispositivo</li>
            <li>No hay servidores que almacenen tu información</li>
            <li>No hay cuentas de usuario ni registro</li>
            <li>No hay cookies de seguimiento</li>
            <li>No hay analytics ni tracking de ningún tipo</li>
            <li>No compartimos datos con terceros (porque no los tenemos)</li>
          </ul>

          <p>
            Si borras los datos de tu navegador o usas otro dispositivo, empezarás
            de cero. Puedes exportar tus datos desde los ajustes de la aplicación
            si quieres hacer una copia de seguridad.
          </p>

          <p className="text-[var(--text-tertiary)]">
            Última actualización: Diciembre 2025
          </p>
        </div>
      </div>
    </div>
  )
}
