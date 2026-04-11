import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'christian.couillard@5pennyai.com'

export default function AdminGuard({ children }) {
  const { t } = useTranslation()
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return
        setSession(data.session)
        setChecking(false)
      })
      .catch(() => {
        if (!cancelled) setChecking(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      cancelled = true
      sub.subscription?.unsubscribe?.()
    }
  }, [])

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center pt-24">
        <p className="text-muted text-sm">{t('admin.checking')}</p>
      </div>
    )
  }

  if (!session) {
    return <LoginForm t={t} />
  }

  if (session.user?.email !== ADMIN_EMAIL) {
    return <DeniedBlock t={t} />
  }

  return children
}

function LoginForm({ t }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message || t('admin.login.error'))
    }
    setSubmitting(false)
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-warm-gray pt-28 pb-16 px-4">
      <div className="w-full max-w-md bg-white border border-navy/[0.08] rounded-3xl p-8 md:p-10 card-elevated">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Lock size={18} strokeWidth={1.8} className="text-accent" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-navy text-xl tracking-tight">
              {t('admin.login.title')}
            </h1>
            <p className="text-[13px] text-muted leading-snug">{t('admin.login.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label={t('admin.login.email')}
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <Field
            label={t('admin.login.password')}
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-[13px] text-accent-deep bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
              {t('admin.login.error')}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent text-white font-heading font-semibold text-[14px] px-7 py-3 shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? t('admin.login.submitting') : t('admin.login.submit')}
          </button>
        </form>
      </div>
    </section>
  )
}

function Field({ label, type = 'text', value, onChange, required, autoComplete }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-navy/65 mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </label>
  )
}

function DeniedBlock({ t }) {
  const handleLogout = () => supabase.auth.signOut()
  return (
    <section className="min-h-[70vh] flex items-center justify-center pt-24 pb-16 px-4">
      <div className="max-w-md text-center bg-white border border-navy/[0.08] rounded-3xl p-10 md:p-12 card-elevated">
        <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-accent/10 flex items-center justify-center">
          <Lock size={20} strokeWidth={1.8} className="text-accent" />
        </div>
        <h1 className="font-heading font-bold text-navy text-2xl mb-2">{t('admin.denied.title')}</h1>
        <p className="text-muted text-[14px] mb-6 leading-relaxed">{t('admin.denied.subtitle')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" to="/">
            {t('admin.denied.back')}
          </Button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-navy/15 text-navy/75 bg-white px-7 py-3 text-[14px] font-heading font-semibold hover:bg-navy/[0.03] hover:border-navy/25 transition-colors"
          >
            {t('admin.denied.logout')}
          </button>
        </div>
      </div>
    </section>
  )
}
