import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Hvis vi sender med en 'next' parameter, sender vi brukeren dit, ellers til forsiden
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    
    // Veksle koden inn i en session (cookies)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Suksess! Send brukeren videre til forsiden (eller min side)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Hvis noe gikk galt, send til en feilside eller tilbake til start
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}