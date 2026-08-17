import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, LoaderCircle, Plus, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  createResourceTopicMembership,
  deleteResourceTopicMembership,
  listAvailableResourceTopics,
  listResourceTopicMemberships,
} from '@/lib/adminResourceTopicMemberships'

const TOPICS_PATH = '/admin/ressources-ia/sujets'

export default function ResourceTopicMembershipsField({ resourceId, resourceType }) {
  const { t } = useTranslation()
  const [memberships, setMemberships] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(Boolean(resourceId))
  const [loadError, setLoadError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [formError, setFormError] = useState(null)

  const load = useCallback(async () => {
    if (!resourceId) return
    setLoading(true)
    setLoadError(null)
    try {
      const [nextMemberships, nextTopics] = await Promise.all([
        listResourceTopicMemberships({ resourceType, resourceId }),
        listAvailableResourceTopics(),
      ])
      setMemberships(nextMemberships)
      setTopics(nextTopics)
    } catch (error) {
      setLoadError(error.code || 'load')
    } finally {
      setLoading(false)
    }
  }, [resourceId, resourceType])

  useEffect(() => { load() }, [load])

  const availableTopics = useMemo(() => {
    const associated = new Set(memberships.map(({ topicId }) => topicId))
    return topics.filter(({ id }) => !associated.has(id))
  }, [memberships, topics])

  const addMembership = async () => {
    if (!selectedTopicId || busyId) return
    setBusyId('create')
    setFormError(null)
    try {
      await createResourceTopicMembership({ resourceType, resourceId, topicId: selectedTopicId })
      setSelectedTopicId('')
      setShowAdd(false)
      await load()
    } catch (error) {
      setFormError(error.code || 'create')
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const removeMembership = async (membership) => {
    if (busyId) return
    setBusyId(membership.id)
    setFormError(null)
    try {
      await deleteResourceTopicMembership({ resourceType, resourceId, membershipId: membership.id })
      setMemberships((current) => current.filter(({ id }) => id !== membership.id))
    } catch (error) {
      setFormError(error.code || 'delete')
      await load()
    } finally {
      setBusyId(null)
    }
  }

  if (!resourceId) return <p className="text-sm text-muted">{t('admin.resourcesAi.topics.memberships.saveFirst')}</p>
  if (loading) return <p role="status" className="flex items-center gap-2 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />{t('admin.resourcesAi.topics.memberships.loading')}</p>
  if (loadError) return <p role="alert" className="text-sm text-red-700">{t(`admin.resourcesAi.topics.memberships.errors.${loadError}`)}</p>

  return (
    <div className="space-y-4">
      {memberships.length === 0 ? <p className="text-sm text-muted">{t('admin.resourcesAi.topics.memberships.empty')}</p> : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {memberships.map((membership) => (
            <li key={membership.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-heading text-sm font-semibold text-navy">{membership.topicName}</p>
              <div className="flex flex-wrap gap-2">
                <Link to={`${TOPICS_PATH}/${membership.topicId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-navy"><ExternalLink size={13} aria-hidden="true" />{t('admin.resourcesAi.topics.memberships.viewTopic')}</Link>
                <button type="button" disabled={Boolean(busyId)} onClick={() => removeMembership(membership)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"><Trash2 size={13} aria-hidden="true" />{t('admin.resourcesAi.topics.memberships.remove')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {availableTopics.length === 0 ? <p className="text-xs text-muted">{t('admin.resourcesAi.topics.memberships.allAssociated')}</p> : !showAdd ? (
        <button type="button" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-full border border-accent/35 px-4 py-2 text-sm font-semibold text-accent-deep"><Plus size={15} aria-hidden="true" />{t('admin.resourcesAi.topics.memberships.add')}</button>
      ) : (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-4">
          <label className="block" htmlFor={`topic-select-${resourceId}`}>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-navy/65">{t('admin.resourcesAi.topics.memberships.topic')}</span>
            <select id={`topic-select-${resourceId}`} value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
              <option value="">{t('admin.resourcesAi.topics.memberships.selectTopic')}</option>
              {availableTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name_fr}</option>)}
            </select>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={!selectedTopicId || Boolean(busyId)} onClick={addMembership} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busyId === 'create' && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}{t('admin.resourcesAi.topics.memberships.associate')}</button>
            <button type="button" disabled={Boolean(busyId)} onClick={() => { setShowAdd(false); setSelectedTopicId(''); setFormError(null) }} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-navy"><X size={14} aria-hidden="true" />{t('admin.resourcesAi.topics.memberships.cancel')}</button>
          </div>
        </div>
      )}
      {formError && <p role="alert" className="text-sm text-red-700">{t(`admin.resourcesAi.topics.memberships.errors.${formError}`)}</p>}
    </div>
  )
}
