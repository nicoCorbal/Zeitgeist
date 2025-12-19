import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function Privacy() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const points = t('privacy.points', { returnObjects: true })

  // Prevent indexing of this page
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg)] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[14px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>

        <h1 className="mt-8 text-[32px] font-bold text-[var(--text)]">
          {t('privacy.title')}
        </h1>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <p>
            <strong className="text-[var(--text)]">{t('privacy.intro')}</strong>
          </p>

          <p>
            {t('privacy.localStorage')}
          </p>

          <p>
            {t('privacy.meaning')}
          </p>

          <ul className="list-disc space-y-2 pl-5">
            {Array.isArray(points) && points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>

          <p>
            <strong className="text-[var(--text)]">{t('privacy.analyticsTitle')}</strong>
          </p>

          <p>
            {t('privacy.analytics')}
          </p>

          <p>
            {t('privacy.dataLoss')}
          </p>

          <p className="text-[var(--text-tertiary)]">
            {t('privacy.lastUpdate')}
          </p>
        </div>
      </div>
    </div>
  )
}
