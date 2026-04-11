import { getCalApi } from '@calcom/embed-react'

export const CAL_LINK = '5pennyai/30min'
export const CAL_BRAND_COLOR = '#DD8737'

let initPromise = null

export function initCal() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const cal = await getCalApi()
    cal('ui', {
      theme: 'light',
      styles: { branding: { brandColor: CAL_BRAND_COLOR } },
      hideEventTypeDetails: false,
    })
  })()
  return initPromise
}

export async function openBookingModal(calLink = CAL_LINK) {
  await initCal()
  if (typeof window !== 'undefined' && window.Cal) {
    window.Cal('modal', { calLink })
  }
}
