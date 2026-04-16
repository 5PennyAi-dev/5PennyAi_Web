import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin } from 'lucide-react'
import Cal from '@calcom/embed-react'
import Button from '@/components/ui/Button'
import BookingButton from '@/components/ui/BookingButton'
import ShaderBackground from '@/components/ui/ShaderBackground'
import useScrollReveal from '@/hooks/useScrollReveal'
import { CAL_LINK } from '@/lib/cal'

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}


const inputClass =
  'w-full bg-white border border-navy/[0.12] rounded-xl px-4 py-3 ' +
  'text-[14px] text-navy placeholder:text-navy/40 ' +
  'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 ' +
  'transition-colors duration-200'

const labelClass = 'block text-[13px] font-semibold text-navy mb-2 tracking-tight'

export default function Contact() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const formRef = useScrollReveal()
  const infoRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const initialForm = { name: '', email: '', subject: 'app', message: '' }
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (status === 'success' || status === 'error') setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('https://formspree.io/f/mnjokepp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      setForm(initialForm)
    } catch {
      setStatus('error')
    }
  }

  const subjects = t('contact.form.subjects', { returnObjects: true }) || {}

  return (
    <>
      <Helmet>
        <title>{t('contact.seo.title')}</title>
        <meta name="description" content={t('contact.seo.description')} />
      </Helmet>

      {/* Hero compact */}
      <section
        ref={heroRef}
        className="reveal relative pt-36 pb-24 md:pt-40 md:pb-28 overflow-hidden bg-grain"
        style={{
          backgroundColor: '#0D2240',
          backgroundImage:
            'radial-gradient(ellipse 80% 70% at 70% 20%, rgba(221,135,55,0.16), transparent 60%), ' +
            'radial-gradient(ellipse 70% 70% at 20% 100%, rgba(129,174,215,0.20), transparent 60%), ' +
            'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
        }}
      >
        <ShaderBackground />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
            <span className="text-white/75 uppercase tracking-[0.2em] text-[11px] font-bold">
              {t('contact.hero.overline')}
            </span>
          </div>
          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-white mb-5">
            {t('contact.hero.title')}
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('contact.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
            {/* Form */}
            <div ref={formRef} className="reveal">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    {t('contact.form.name')}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t('contact.form.name_placeholder')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    {t('contact.form.email')}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t('contact.form.email_placeholder')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className={labelClass}>
                    {t('contact.form.subject')}
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {Object.entries(subjects).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className={labelClass}>
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t('contact.form.message_placeholder')}
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full md:w-auto px-8 py-3.5 text-[15px]"
                  >
                    {status === 'loading'
                      ? t('contact.form.sending')
                      : t('contact.form.submit')}
                  </Button>

                  {status === 'success' && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="text-[14px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
                    >
                      {t('contact.form.success')}
                    </p>
                  )}
                  {status === 'error' && (
                    <p
                      role="alert"
                      aria-live="assertive"
                      className="text-[14px] font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                    >
                      {t('contact.form.error')}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Info */}
            <div
              ref={infoRef}
              className="reveal"
              style={{ transitionDelay: '100ms' }}
            >
              <div className="bg-warm-gray border border-navy/[0.08] rounded-3xl p-7 md:p-8 card-elevated">
                {/* Coordonnées */}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-navy/55 mb-4">
                    {t('contact.info.title')}
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="mailto:christian.couillard@5pennyai.com"
                        className="flex items-center gap-3 text-muted hover:text-accent text-[14px] transition-colors duration-200"
                      >
                        <Mail size={16} className="text-accent shrink-0" strokeWidth={2} />
                        <span className="break-all">christian.couillard@5pennyai.com</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="tel:+14182089866"
                        className="flex items-center gap-3 text-muted hover:text-accent text-[14px] transition-colors duration-200"
                      >
                        <Phone size={16} className="text-accent shrink-0" strokeWidth={2} />
                        <span>{t('contact.info.phone')}</span>
                      </a>
                    </li>
                    <li className="flex items-center gap-3 text-muted text-[14px]">
                      <MapPin size={16} className="text-accent shrink-0" strokeWidth={2} />
                      <span>{t('contact.info.location')}</span>
                    </li>
                  </ul>
                </div>

                <div className="my-6 h-px bg-navy/[0.08]" />

                {/* Social */}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-navy/55 mb-3">
                    {t('contact.info.social_title')}
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.linkedin.com/in/christian-couillard-86705146/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-10 h-10 rounded-full border border-navy/10 flex items-center justify-center text-navy/50 hover:text-accent hover:border-accent/40 hover:bg-navy/[0.03] transition-all duration-200"
                    >
                      <LinkedinIcon />
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61576445489064"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-10 h-10 rounded-full border border-navy/10 flex items-center justify-center text-navy/50 hover:text-accent hover:border-accent/40 hover:bg-navy/[0.03] transition-all duration-200"
                    >
                      <FacebookIcon />
                    </a>
                    <a
                      href="mailto:info@5pennyai.com"
                      aria-label="Email"
                      className="w-10 h-10 rounded-full border border-navy/10 flex items-center justify-center text-navy/50 hover:text-accent hover:border-accent/40 hover:bg-navy/[0.03] transition-all duration-200"
                    >
                      <Mail size={18} aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="my-6 h-px bg-navy/[0.08]" />

                {/* Booking */}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-navy/55 mb-3">
                    {t('contact.booking.label')}
                  </p>
                  <p className="text-muted text-[14px] leading-relaxed mb-5">
                    {t('contact.booking.text')}
                  </p>

                  <div
                    id="calendar"
                    className="rounded-2xl border border-navy/[0.08] bg-white overflow-hidden min-h-[620px]"
                  >
                    <Cal
                      calLink={CAL_LINK}
                      config={{ layout: 'month_view', theme: 'light' }}
                      style={{ width: '100%', height: '100%', minHeight: '620px', overflow: 'scroll' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section ref={ctaRef} className="reveal py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden bg-grain ring-inner-highlight"
            style={{
              backgroundColor: '#0D2240',
              backgroundImage:
                'radial-gradient(ellipse 70% 80% at 80% 0%, rgba(221,135,55,0.18), transparent 60%), ' +
                'radial-gradient(ellipse 70% 80% at 20% 100%, rgba(129,174,215,0.18), transparent 60%), ' +
                'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
            }}
          >
            <div className="absolute inset-0 bg-dot-grid-dark opacity-25 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-display text-[2rem] md:text-[2.5rem] font-bold text-white mb-4">
                {t('contact.cta.title')}
              </h2>
              <p className="text-white/65 text-base mb-8 max-w-md mx-auto leading-relaxed">
                {t('contact.cta.subtitle')}
              </p>
              <BookingButton variant="primary" className="px-8 py-3.5 text-[15px]">
                {t('contact.cta.button')}
              </BookingButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
