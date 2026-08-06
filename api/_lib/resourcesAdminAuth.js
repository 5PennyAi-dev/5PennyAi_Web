/* global process */
import { createClient } from '@supabase/supabase-js'

export const RESOURCES_ADMIN_EMAIL = 'christian.couillard@5pennyai.com'

export class ResourcesAdminAuthError extends Error {
  constructor(code, status) {
    super(code)
    this.name = 'ResourcesAdminAuthError'
    this.code = code
    this.status = status
  }
}

export function createResourcesServerClient(
  environment = process.env,
  createClientImpl = createClient,
) {
  const supabaseUrl = environment.SUPABASE_URL || environment.VITE_SUPABASE_URL
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new ResourcesAdminAuthError('server_not_configured', 500)
  }

  return createClientImpl(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function authorizeResourcesAdminRequest(
  req,
  supabase,
  adminEmail = RESOURCES_ADMIN_EMAIL,
) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const match = /^Bearer\s+(\S+)$/i.exec(header)
  if (!match) throw new ResourcesAdminAuthError('unauthenticated', 401)

  const { data, error } = await supabase.auth.getUser(match[1])
  if (error || !data?.user) throw new ResourcesAdminAuthError('unauthenticated', 401)
  if (data.user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new ResourcesAdminAuthError('forbidden', 403)
  }

  return data.user
}
