'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Typer for TypeScript
type Aktivitet = {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  sted: string
}

type Profil = {
  id: string
  full_name: string
  rolle: string
  invite_code: string | null
}

export default function MinSide() {
  const supabase = createClient()
  const router = useRouter()
  
  const [profil, setProfil] = useState<Profil | null>(null)
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [mineSeniorer, setMineSeniorer] = useState<Profil[]>([])
  const [loading, setLoading] = useState(true)
  
  // For pårørende som skal koble seg til
  const [inputKode, setInputKode] = useState('')
  const [koblingsStatus, setKoblingsStatus] = useState('')

  useEffect(() => {
    lastData()
  }, [])

  const lastData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Hent min profil
    const { data: minProfil } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (minProfil) {
      setProfil(minProfil)
      
      // LOGIKK FOR SENIORER
      if (minProfil.rolle === 'senior') {
        // Hvis senior mangler kode, lag en nå!
        if (!minProfil.invite_code) {
          const nyKode = genererKode()
          await supabase.from('profiles').update({ invite_code: nyKode }).eq('id', user.id)
          minProfil.invite_code = nyKode // Oppdater lokalt
          setProfil({...minProfil}) // Tving oppdatering av skjermen
        }
        
        // Hent alle aktiviteter (Marketplace)
        const { data: akt } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
        if (akt) setAktiviteter(akt)
      
      // LOGIKK FOR PÅRØRENDE
      } else if (minProfil.rolle === 'familie') {
        // Finn seniorene jeg er koblet til
        const { data: linker } = await supabase
          .from('family_links')
          .select('senior_id')
          .eq('relative_id', user.id)
        
        if (linker && linker.length > 0) {
          const seniorIder = linker.map(l => l.senior_id)
          
          // Hent navn på seniorene
          const { data: seniorProfiler } = await supabase
            .from('profiles')
            .select('*')
            .in('id', seniorIder)
          
          if (seniorProfiler) setMineSeniorer(seniorProfiler)

          // Hent aktiviteter disse seniorene SKAL på (via participants tabellen)
          const { data: paameldinger } = await supabase
            .from('participants')
            .select('activity_id, user_id')
            .in('user_id', seniorIder)

          if (paameldinger && paameldinger.length > 0) {
            const aktivitetIder = paameldinger.map(p => p.activity_id)
            const { data: seniorAktiviteter } = await supabase
              .from('activities')
              .select('*')
              .in('id', aktivitetIder)
            
            if (seniorAktiviteter) setAktiviteter(seniorAktiviteter)
          }
        }
      }
    }
    setLoading(false)
  }

  // Hjelpefunksjon: Lager en kode som "SOL-82"
  const genererKode = () => {
    const ord = ['TUR', 'SOL', 'HAV', 'BY', 'HEI', 'VENN']
    const tilfeldigOrd = ord[Math.floor(Math.random() * ord.length)]
    const tilfeldigTall = Math.floor(Math.random() * 900) + 100
    return `${tilfeldigOrd}-${tilfeldigTall}`
  }

  // Hjelpefunksjon: Pårørende kobler seg til
  const kobleTilSenior = async () => {
    if (!profil) return
    setKoblingsStatus('Leter...')
    
    // 1. Finn senior med koden
    const { data: senior } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('invite_code', inputKode.toUpperCase())
      .single()

    if (!senior) {
      setKoblingsStatus('Fant ingen med denne koden.')
      return
    }

    // 2. Lagre koblingen
    const { error } = await supabase
      .from('family_links')
      .insert({ relative_id: profil.id, senior_id: senior.id })

    if (error) {
      setKoblingsStatus('Dere er allerede koblet sammen (eller noe gikk galt).')
    } else {
      setKoblingsStatus(`Hurra! Du er nå koblet til ${senior.full_name}. Oppdater siden for å se timeplanen.`)
      window.location.reload() // Enkel måte å oppdatere alt på
    }
  }

  const loggUt = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return <div className="p-10 text-xl text-center">Laster din side...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      
      <header className="bg-blue-900 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">NyeVenner</h1>
            <p className="text-blue-200">
              {profil?.rolle === 'senior' ? 'Din oversikt' : 'Pårørende-oversikt'}
            </p>
          </div>
          <button onClick={loggUt} className="underline hover:text-blue-200">Logg ut</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-6">

        {/* --- VISNING FOR SENIOR --- */}
        {profil?.rolle === 'senior' && (
          <>
            <div className="bg-yellow-50 border-l-8 border-yellow-400 p-6 rounded-r-xl shadow-sm mb-8">
              <h3 className="text-xl font-bold text-yellow-800">👋 Hei {profil.full_name}!</h3>
              <p className="text-lg text-yellow-900 mt-2">
                Vil du at familien skal se hva du skal på? Gi dem denne koden:
              </p>
              <div className="mt-4 bg-white inline-block px-8 py-4 rounded-xl border-2 border-dashed border-yellow-500">
                <span className="text-4xl font-mono font-bold tracking-widest text-gray-800">
                  {profil.invite_code || 'Lager kode...'}
                </span>
              </div>
            </div>

            <div className="mb-10 text-center">
              <Link href="/ny-aktivitet" className="inline-block bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg">
                + Lag ny aktivitet
              </Link>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Aktiviteter i nærheten</h2>
          </>
        )}


        {/* --- VISNING FOR PÅRØRENDE --- */}
        {profil?.rolle === 'familie' && (
          <>
            {mineSeniorer.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-md text-center mb-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Koble til Senior</h3>
                <p className="mb-6 text-gray-600">Få koden fra senioren (f.eks TUR-123) og skriv den her:</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <input 
                    value={inputKode}
                    onChange={(e) => setInputKode(e.target.value)}
                    placeholder="Kode her..."
                    className="p-4 border-2 border-gray-300 rounded-xl text-xl uppercase font-mono text-center w-full"
                  />
                  <button 
                    onClick={kobleTilSenior}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 w-full sm:w-auto"
                  >
                    Koble til
                  </button>
                </div>
                {koblingsStatus && <p className="mt-4 font-bold text-blue-800">{koblingsStatus}</p>}
              </div>
            ) : (
              <div className="mb-8 bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-bold text-green-800">
                  Du følger: {mineSeniorer.map(s => s.full_name).join(', ')}
                </h3>
                <p className="text-green-700">Her er aktivitetene de har meldt seg på:</p>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {mineSeniorer.length > 0 ? 'Planlagte aktiviteter' : 'Ingen aktiviteter å vise enda'}
            </h2>
          </>
        )}


        {/* --- FELLES LISTE MED AKTIVITETER --- */}
        {aktiviteter.length === 0 && profil?.rolle === 'familie' && mineSeniorer.length > 0 && (
          <p className="text-gray-500 italic">Senioren din har ikke meldt seg på noe enda.</p>
        )}

        <div className="grid gap-6">
          {aktiviteter.map((aktivitet) => (
            <div key={aktivitet.id} className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">{aktivitet.tittel}</h3>
                  <div className="flex gap-4 text-gray-600 mb-2">
                    <span>📅 {aktivitet.dato}</span>
                    <span>📍 {aktivitet.sted}</span>
                  </div>
                </div>
                <Link 
                  href={`/aktivitet/${aktivitet.id}`} 
                  className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg font-bold hover:bg-blue-200"
                >
                  Se mer →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}