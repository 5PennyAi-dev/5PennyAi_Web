import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, LoaderCircle, Plus, Save, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  createResourceMembership,
  deleteMembership,
  listAvailableSeries,
  listResourceMemberships,
  updateMembershipPosition,
} from '@/lib/adminResourceSeriesMemberships'

const SERIES_PATH = '/admin/ressources-ia/series'

export default function ResourceSeriesMembershipsField({ resourceId, resourceType }) {
  const { t } = useTranslation()
  const [memberships, setMemberships] = useState([])
  const [allSeries, setAllSeries] = useState([])
  const [positions, setPositions] = useState({})
  const [loading, setLoading] = useState(Boolean(resourceId))
  const [loadError, setLoadError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [formError, setFormError] = useState(null)

  const load = useCallback(async () => {
    if (!resourceId) return
    setLoading(true)
    setLoadError(null)
    try {
      const [nextMemberships, nextSeries] = await Promise.all([
        listResourceMemberships({ resourceType, resourceId }),
        listAvailableSeries(),
      ])
      setMemberships(nextMemberships)
      setAllSeries(nextSeries)
      setPositions(Object.fromEntries(nextMemberships.map(({ id, position }) => [id, position ?? ''])))
    } catch (error) {
      setLoadError(error.code || 'load')
    } finally {
      setLoading(false)
    }
  }, [resourceId, resourceType])

  useEffect(() => {
    load()
  }, [load])

  const availableSeries = useMemo(() => {
    const associated = new Set(memberships.map(({ seriesId }) => seriesId))
    return allSeries.filter(({ id }) => !associated.has(id))
  }, [allSeries, memberships])

  const savePosition = async (membership) => {
    if (busyId) return
    setBusyId(membership.id)
    setFormError(null)
    try {
      const updated = await updateMembershipPosition({
        resourceType,
        resourceId,
        membershipId: membership.id,
        position: positions[membership.id],
      })
      setMemberships((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, position: updated.position } : item)),
      )
      setPositions((current) => ({ ...current, [membership.id]: updated.position ?? '' }))
    } catch (error) {
      setFormError(error.code || 'update')
      setPositions((current) => ({ ...current, [membership.id]: membership.position ?? '' }))
    } finally {
      setBusyId(null)
    }
  }

  const addMembership = async () => {
    if (!selectedSeriesId || busyId) return
    setBusyId('create')
    setFormError(null)
    try {
      await createResourceMembership({
        resourceType,
        resourceId,
        seriesId: selectedSeriesId,
        position: newPosition,
      })
      setSelectedSeriesId('')
      setNewPosition('')
      setShowAdd(false)
      await load()
    } catch (error) {
      setFormError(error.code || 'create')
    } finally {
      setBusyId(null)
    }
  }

  const removeMembership = async (membership) => {
    if (busyId || !window.confirm(t('admin.resourcesAi.memberships.removeConfirm', { name: membership.seriesName }))) return
    setBusyId(membership.id)
    setFormError(null)
    try {
      await deleteMembership({ resourceType, resourceId, membershipId: membership.id })
      setMemberships((current) => current.filter(({ id }) => id !== membership.id))
    } catch (error) {
      setFormError(error.code || 'delete')
    } finally {
      setBusyId(null)
    }
  }

  if (!resourceId) {
    return <p className="text-sm text-muted">{t('admin.resourcesAi.memberships.saveFirst')}</p>
  }
  if (loading) {
    return <p role="status" className="flex items-center gap-2 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />{t('admin.resourcesAi.memberships.loading')}</p>
  }
  if (loadError) {
    return <p role="alert" className="text-sm text-red-700">{t(`admin.resourcesAi.memberships.errors.${loadError}`)}</p>
  }

  return (
    <div className="space-y-4">
      {memberships.length === 0 ? (
        <p className="text-sm text-muted">{t('admin.resourcesAi.memberships.empty')}</p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {memberships.map((membership) => (
            <li key={membership.id} className="rounded-xl border border-gray-200 bg-surface p-4">
              <p className="font-heading text-sm font-semibold text-navy">{membership.seriesName}</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1 text-xs font-medium text-navy">
                  {t('admin.resourcesAi.memberships.position')}
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={positions[membership.id] ?? ''}
                    onChange={(event) => setPositions((current) => ({ ...current, [membership.id]: event.target.value }))}
                    aria-describedby={formError === 'positionConflict' ? 'series-membership-error' : undefined}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </label>
                <button type="button" disabled={Boolean(busyId) || positions[membership.id] === (membership.position ?? '')} onClick={() => savePosition(membership)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-navy disabled:opacity-50">
                  <Save size={14} aria-hidden="true" />{t('admin.resourcesAi.memberships.savePosition')}
                </button>
              </div>
              {membership.position == null && <p className="mt-1 text-xs text-muted">{t('admin.resourcesAi.memberships.positionUndefined')}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`${SERIES_PATH}/${membership.seriesId}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-navy sm:flex-none">
                  <ExternalLink size={14} aria-hidden="true" />{t('admin.resourcesAi.memberships.viewSeries')}
                </Link>
                <button type="button" disabled={Boolean(busyId)} onClick={() => removeMembership(membership)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50 sm:flex-none">
                  <Trash2 size={14} aria-hidden="true" />{t('admin.resourcesAi.memberships.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formError && <p id="series-membership-error" role="alert" className="text-sm text-red-700">{t(`admin.resourcesAi.memberships.errors.${formError}`)}</p>}

      {showAdd ? (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-4">
          <p className="font-heading text-sm font-semibold text-navy">{t('admin.resourcesAi.memberships.addTitle')}</p>
          {availableSeries.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t('admin.resourcesAi.memberships.allAssociated')}</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end">
              <label className="text-xs font-medium text-navy">
                {t('admin.resourcesAi.memberships.series')}
                <select required value={selectedSeriesId} onChange={(event) => setSelectedSeriesId(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
                  <option value="">{t('admin.resourcesAi.memberships.selectSeries')}</option>
                  {availableSeries.map((series) => <option key={series.id} value={series.id}>{series.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-navy">
                {t('admin.resourcesAi.memberships.optionalPosition')}
                <input type="number" min="1" step="1" value={newPosition} onChange={(event) => setNewPosition(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
              </label>
              <button type="button" onClick={addMembership} disabled={!selectedSeriesId || Boolean(busyId)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busyId === 'create' ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}{t('admin.resourcesAi.memberships.associate')}
              </button>
            </div>
          )}
          <button type="button" disabled={Boolean(busyId)} onClick={() => { setShowAdd(false); setFormError(null) }} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-navy/70">
            <X size={14} aria-hidden="true" />{t('admin.resourcesAi.memberships.cancel')}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={availableSeries.length === 0} onClick={() => { setShowAdd(true); setFormError(null) }} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={15} aria-hidden="true" />{t('admin.resourcesAi.memberships.add')}
          </button>
          <Link to={SERIES_PATH} className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-navy">{t('admin.resourcesAi.memberships.manageSeries')}</Link>
          {availableSeries.length === 0 && <p className="w-full text-xs text-muted">{t('admin.resourcesAi.memberships.allAssociated')}</p>}
        </div>
      )}
    </div>
  )
}
