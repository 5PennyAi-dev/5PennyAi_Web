import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, Plus, LogOut, ArrowUpCircle, Archive, RotateCcw } from 'lucide-react'
import AdminGuard from '@/components/admin/AdminGuard'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { fetchAllPostsAdmin, deletePost, updatePostStatus } from '@/lib/posts'

export default function AdminBlog() {
  return (
    <AdminGuard>
      <AdminBlogInner />
    </AdminGuard>
  )
}

function formatDate(dateString, lang) {
  if (!dateString) return '—'
  try {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  } catch {
    return '—'
  }
}

function AdminBlogInner() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr'
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllPostsAdmin()
      setPosts(data)
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.posts.deleteConfirm'))) return
    try {
      await deletePost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      window.alert(t('admin.editor.feedback.error'))
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await updatePostStatus(id, status)
      await load()
    } catch (err) {
      console.error(err)
      window.alert(t('admin.editor.feedback.error'))
    }
  }

  const handleLogout = () => supabase.auth.signOut()

  return (
    <section className="pt-28 pb-20 bg-warm-gray min-h-[90vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent mb-2">
              {t('blog.hero.overline')} · ADMIN
            </p>
            <h1 className="font-heading font-bold text-navy text-2xl md:text-3xl tracking-tight">
              {t('admin.posts.title')}
            </h1>
            <p className="text-muted text-[14px] mt-1">{t('admin.posts.subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button to="/admin/blog/new" variant="primary" className="inline-flex items-center gap-2">
              <Plus size={16} strokeWidth={2.2} />
              {t('admin.posts.new')}
            </Button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[13px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors"
            >
              <LogOut size={14} strokeWidth={2} />
              {t('admin.nav.logout')}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted text-sm py-10 text-center">{t('blog.loading')}</p>
        ) : error ? (
          <p className="text-accent-deep text-sm py-10 text-center">
            {t('admin.editor.feedback.error')}
          </p>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-navy/[0.08] p-10 text-center">
            <p className="text-muted">{t('admin.posts.empty')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-navy/[0.08] overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:grid grid-cols-[1fr_140px_140px_180px] gap-4 px-6 py-4 border-b border-navy/[0.06] bg-warm-gray/40 text-[11px] font-bold uppercase tracking-[0.14em] text-navy/55">
              <div>{t('admin.posts.columns.title')}</div>
              <div>{t('admin.posts.columns.status')}</div>
              <div>{t('admin.posts.columns.date')}</div>
              <div className="text-right">{t('admin.posts.columns.actions')}</div>
            </div>

            <ul className="divide-y divide-navy/[0.06]">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="px-6 py-4 md:grid md:grid-cols-[1fr_140px_140px_180px] md:gap-4 md:items-center flex flex-col gap-3"
                >
                  <div>
                    <p className="font-heading font-semibold text-navy text-[15px] tracking-tight">
                      {post.title_fr}
                    </p>
                    <p className="text-muted text-[12px] mt-0.5 font-mono">/{post.slug}</p>
                  </div>

                  <div>
                    <StatusBadge status={post.status} t={t} />
                  </div>

                  <div className="text-[13px] text-muted tnum">
                    {formatDate(post.published_at, lang)}
                  </div>

                  <div className="flex items-center gap-2 md:justify-end">
                    <IconAction
                      to={`/admin/blog/edit/${post.id}`}
                      icon={Pencil}
                      label={t('admin.posts.edit')}
                    />
                    {post.status !== 'published' && (
                      <IconAction
                        onClick={() => handleStatus(post.id, 'published')}
                        icon={ArrowUpCircle}
                        label={t('admin.posts.publish')}
                      />
                    )}
                    {post.status === 'published' && (
                      <IconAction
                        onClick={() => handleStatus(post.id, 'archived')}
                        icon={Archive}
                        label={t('admin.posts.archive')}
                      />
                    )}
                    {post.status === 'archived' && (
                      <IconAction
                        onClick={() => handleStatus(post.id, 'draft')}
                        icon={RotateCcw}
                        label={t('admin.posts.unarchive')}
                      />
                    )}
                    <IconAction
                      onClick={() => handleDelete(post.id)}
                      icon={Trash2}
                      label={t('admin.posts.delete')}
                      danger
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

function StatusBadge({ status, t }) {
  const label = t(`admin.posts.status.${status}`)
  const tone = {
    draft: 'bg-lavender/50 text-navy',
    published: 'bg-steel/25 text-navy',
    archived: 'bg-accent/10 text-accent-deep',
  }[status] || 'bg-navy/10 text-navy'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${tone}`}
    >
      {label}
    </span>
  )
}

function IconAction({ to, onClick, icon: Icon, label, danger }) {
  const base =
    'inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors'
  const idle = danger
    ? 'border-navy/15 text-muted hover:text-accent-deep hover:border-accent/40 hover:bg-accent/5'
    : 'border-navy/15 text-navy/65 hover:text-navy hover:border-navy/30 hover:bg-navy/[0.03]'
  const classes = `${base} ${idle}`
  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label} title={label}>
        <Icon size={15} strokeWidth={1.8} />
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={classes} aria-label={label} title={label}>
      <Icon size={15} strokeWidth={1.8} />
    </button>
  )
}
