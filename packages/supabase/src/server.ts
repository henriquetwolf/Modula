import { createServerClient as createClient } from '@supabase/ssr'
import type { Database } from './types'

export function createServerClient(cookieStore: {
  getAll: () => { name: string; value: string }[]
  setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) => void
}) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.setAll([{ name, value, options }])
            )
          } catch {
            // setAll may throw in Server Components — safe to ignore
          }
        },
      },
    }
  )
}
