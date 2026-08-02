import { createClient } from '@supabase/supabase-js'

const nodeTest = Boolean(globalThis.process?.env?.NODE_TEST_CONTEXT)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || (nodeTest ? 'http://127.0.0.1:54321' : undefined)
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || (nodeTest ? 'test-anon-key' : undefined)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
