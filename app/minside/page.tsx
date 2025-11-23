'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, MapPin, Calendar, Users } from 'lucide-react'

// Typer
type Aktivitet = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string }
type Profil = { id: string; full_name: string; rolle: string; invite_code: string | null }

export default function MinSide() {
  const supabase = createClient()
  const router = useRouter()
  
  const [profil, setProfil] = useState<Profil | null>(null)
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [mineBrukere, setMineBrukere] = useState<Profil[]>([]) // Endret fra Senior
  const [loading, setLoading] = useState(true)
  const [inputKode, setInputKode] = useState('')
  const [koblingsStatus, setKoblingsStatus] = useState('')

  useEffect(() => { lastData() }, [])

  const lastData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: minProfil } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    
    if (minProfil) {
      setProfil(minProfil)
      
      if (minProfil.rolle === 'senior') { // Vi beholder 'senior' i databasen, men viser 'Bruker'
        if (!minProfil.invite_code) {
          const nyKode = genererKode()
          await supabase.from('profiles').update({ invite_code: nyKode }).eq('id', user.id)
          minProfil.invite_code = nyKode
          setProfil({...minProfil})
        }
        const { data: akt } = await supabase.from('activities').select('*').order('created_at', { ascending: false })
        if (akt) setAktiviteter(akt)
      
      } else if (minProfil.rolle === 'familie') {
        const { data: linker } = await supabase.from('family_links').select('senior_id').eq('relative_id', user.id)
        
        if (linker && linker.length > 0) {
          const seniorIder = linker.map(l => l.senior_id)
          const { data: brukerProfiler } = await supabase.from('profiles').select('*').in('id', seniorIder)
          if (brukerProfiler) setMineBrukere(brukerProfiler)

          const { data: paameldinger } = await supabase.from('participants').select('activity_id').in('user_id', seniorIder)
          if (paameldinger && paameldinger.length > 0) {
            const aktivitetIder = paameldinger.map(p => p.activity_id)
            const { data: brukerAktiviteter } = await supabase.from('activities').select('*').in('id', aktivitetIder)
            if (brukerAktiviteter) setAktiviteter(brukerAktiviteter)
          }
        }
      }
    }
    setLoading(false)
  }

  const genererKode = () => {
    const ord = ['TUR', 'BY', 'HEI', 'VENN']
    return `${ord[Math.floor(Math.random() * ord.length)]}-${Math.floor(Math.random() * 900) + 100}`
  }

  const kobleTilBruker = async () => {
    if (!profil) return
    setKoblingsStatus('Leter...')
    const { data: bruker } = await supabase.from('profiles').select('id, full_name').eq('invite_code', inputKode.toUpperCase()).single()

    if (!bruker) { setKoblingsStatus('Fant ingen med denne koden.'); return }

    const { error } = await supabase.from('family_links').insert({ relative_id: profil.id, senior_id: bruker.id })
    if (error) setKoblingsStatus('Dere er allerede koblet sammen.')
    else { setKoblingsStatus(`Koblet til ${bruker.full_name}!`); window.location.reload() }
  }

  const loggUt = async () => { await supabase.auth.signOut(); router.push('/'); router.refresh() }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600">Laster...</div>

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800">
      
      {/* Moderne Glass Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NyeVenner
          </h1>
        </div>
        <button onClick={loggUt} className="p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">

        {/* --- VELKOMSTSEKSJON --- */}
        <section className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Hei, {profil?.full_name?.split(' ')[0]}! 👋</h2>
            
            {profil?.rolle === 'senior' ? (
              <div>
                <p className="text-blue-100 text-lg mb-8 max-w-xl">
                  Deler du koden din, kan familien se hva du skal på. Din kode er:
                </p>
                <div className="bg-white/20 backdrop-blur-sm inline-block px-8 py-4 rounded-2xl border border-white/30">
                  <span className="text-4xl font-mono font-bold tracking-widest">{profil.invite_code}</span>
                </div>
              </div>
            ) : (
               <p className="text-blue-100 text-lg">
                 Her får du oversikt over aktivitetene til dine nærmeste.
               </p>
            )}
          </div>
          {/* Dekorativ sirkel */}
          <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </section>

        {/* --- Handlinger (Kun for Brukere/Seniorer) --- */}
        {profil?.rolle === 'senior' && (
           <div className="flex justify-center">
             <Link href="/ny-aktivitet" className="group flex items-center gap-3 bg-white pl-6 pr-8 py-4 rounded-full shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
               <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200 transition-colors">
                 <Plus className="text-green-700" size={24} />
               </div>
               <span className="text-xl font-bold text-gray-700">Lag en ny aktivitet</span>
             </Link>
           </div>
        )}

        {/* --- Pårørende Kobling --- */}
        {profil?.rolle === 'familie' && mineBrukere.length === 0 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Koble til Bruker</h3>
            <div className="flex gap-2">
              <input 
                value={inputKode} 
                onChange={e => setInputKode(e.target.value)} 
                placeholder="Skriv koden (f.eks TUR-123)"
                className="flex-1 p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={kobleTilBruker} className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700">
                Koble
              </button>
            </div>
            {koblingsStatus && <p className="mt-4 text-blue-600 font-medium">{koblingsStatus}</p>}
          </div>
        )}

        {/* --- AKTIVITETSLISTE --- */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="text-blue-500" />
            {profil?.rolle === 'senior' ? 'Aktiviteter i nærheten' : 'Planlagte aktiviteter'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="block group">
                <div className="bg-white h-full p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  
                  {/* Etikett */}
                  <div className="flex justify-between items-start mb-4">
                     <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        Aktivitet
                     </span>
                  </div>

                  <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {aktivitet.tittel}
                  </h4>
                  
                  {/* Info */}
                  <div className="space-y-2 mt-auto pt-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} /> <span>{aktivitet.dato}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} /> <span className="truncate">{aktivitet.sted}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}