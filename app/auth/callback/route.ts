import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' param brukes hvis du vil sende brukeren til en spesifikk side etter login
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // Endring her: Vi må bruke 'await' siden createClient nå er asynkron
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Suksess! Send brukeren til forsiden
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Hvis noe gikk galt
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}