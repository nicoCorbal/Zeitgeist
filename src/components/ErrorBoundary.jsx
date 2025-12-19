import { Component } from 'react'
import { RefreshCw } from 'lucide-react'
import i18n from '../i18n'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging (could send to analytics in production)
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleClearAndReload = () => {
    // Clear potentially corrupted localStorage data
    const keysToPreserve = ['denso-theme'] // Keep theme preference
    const preserved = {}

    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) preserved[key] = value
    })

    // Clear all denso keys
    Object.keys(localStorage)
      .filter(key => key.startsWith('denso-'))
      .forEach(key => localStorage.removeItem(key))

    // Restore preserved
    Object.entries(preserved).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })

    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const t = i18n.t.bind(i18n)

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
          <div className="max-w-sm">
            <h1 className="mb-2 text-[17px] font-semibold text-[var(--text)]">
              {t('error.title')}
            </h1>
            <p className="mb-6 text-[13px] text-[var(--text-secondary)]">
              {t('error.description')}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--text)] text-[13px] font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
              >
                <RefreshCw size={16} />
                {t('error.retry')}
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="h-11 w-full rounded-lg border border-[var(--border)] text-[13px] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-tertiary)] hover:text-[var(--text)]"
              >
                {t('error.reset')}
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-[11px] text-[var(--text-tertiary)]">
                  {t('error.details')}
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-[var(--bg-secondary)] p-3 text-[10px] text-[var(--text-tertiary)]">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
