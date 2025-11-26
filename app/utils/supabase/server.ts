import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Denne funksjonen lager en Supabase-klient som kan brukes på serversiden.
// Den er kritisk for å veksle inn auth-koder og lese innloggingsstatus fra cookies.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Dette kan skje hvis du prøver å sette cookies fra en Server Component/Route Handler 
            // som ikke er i en Request/Response-livssyklus (men det skal gå bra her)
            console.error("Failed to set cookie in server client:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error("Failed to remove cookie in server client:", error)
          }
        },
      },
    }
  )
}