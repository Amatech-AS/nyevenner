'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Search, Users, ArrowRight } from 'lucide-react'

type Aktivitet = { 
  id: string; 
  tittel: string; 
  beskrivelse: string; 
  dato: string; 
  sted: string;
  max_deltakere: number | null;
}

export default function LandingPage() {
  const supabase = createClient()
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [alleAktiviteter, setAlleAktiviteter] = useState<Aktivitet[]>([])
  const [soketekst, setSoketekst] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hentData() {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)
      
      if (data) {
        setAktiviteter(data)
        setAlleAktiviteter(data)
      }
      setLoading(false)
    }
    hentData()
  }, [])

  useEffect(() => {
    if (!soketekst.trim()) {
      setAktiviteter(alleAktiviteter)
    } else {
      const filtrert = alleAktiviteter.filter(a => 
        a.sted.toLowerCase().includes(soketekst.toLowerCase()) || 
        a.tittel.toLowerCase().includes(soketekst.toLowerCase())
      )
      setAktiviteter(filtrert)
    }
  }, [soketekst, alleAktiviteter])

  // Funksjon som gir en unik, moderne farge til hver tittel
  const getTitleColor = (id: string) => {
    // Liste over moderne farger (ikke for blasse, men behagelige)
    const colors = [
      'text-blue-600',    // Blå
      'text-emerald-600', // Grønn
      'text-rose-500',    // Rød/Rosa
      'text-violet-600',  // Lilla
      'text-amber-600',   // Oransje/Gul
      'text-cyan-600',    // Turkis
      'text-indigo-600',  // Mørkeblå
      'text-pink-600'     // Rosa
    ]
    // Velg farge basert på siste tegn i ID-en (så den alltid er lik for samme aktivitet)
    const index = id.charCodeAt(id.length - 1) % colors.length
    return colors[index]
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- HEADER --- */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
            NyeVenner
          </Link>
          <Link 
            href="/login" 
            className="text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-700 transition-all"
          >
            Logg inn
          </Link>
        </div>
      </nav>

      {/* --- HERO / SØK --- */}
      <div className="px-6 py-20 md:py-32 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
          Finn noen å finne på <br className="hidden md:block"/> noe sammen med.
        </h1>
        <p className="text-slate-500 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          En enkel oversikt over hyggelige aktiviteter i ditt nærområde. 
          Helt gratis og åpent for alle.
        </p>

        {/* Minimalistisk søkefelt (Ingen rammer, kun skygge) */}
        <div className="relative max-w-xl mx-auto group">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-full p-2 flex items-center shadow-xl shadow-slate-200/50">
            <div className="pl-4 text-slate-400">
              <Search size={22} />
            </div>
            <input 
              type="text"
              value={soketekst}
              onChange={(e) => setSoketekst(e.target.value)}
              placeholder="Søk etter sted eller aktivitet..."
              className="w-full py-3 px-4 bg-transparent outline-none text-slate-800 text-lg placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* --- AKTIVITETSLISTE --- */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="mb-12 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kommende aktiviteter</h2>
          <span className="text-slate-400 text-sm font-medium">{aktiviteter.length} aktiviteter funnet</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Laster inn...</div>
        ) : aktiviteter.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Ingen treff på søket ditt.</p>
            <button onClick={() => setSoketekst('')} className="mt-2 text-blue-600 font-bold hover:underline">
              Vis alt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4"> 
            {/* Endret til 1 kolonne for bedre fokus på tekst, eller grid-cols-2 for desktop */}
            <div className="grid gap-6 sm:grid-cols-2">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group block h-full">
                {/* KORTET - Helt uten border, kun hvit bakgrunn og soft hover */}
                <div className="bg-white rounded-3xl p-6 h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col justify-between">
                  
                  <div>
                    {/* Dato (Liten og diskret overskrift) */}
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <Calendar size={14} />
                      <span>{aktivitet.dato}</span>
                    </div>

                    {/* Tittel med unik farge */}
                    <h3 className={`text-2xl font-bold mb-3 leading-tight group-hover:opacity-80 transition-opacity ${getTitleColor(aktivitet.id)}`}>
                      {aktivitet.tittel}
                    </h3>
                    
                    {/* Sted */}
                    <div className="flex items-center gap-2 text-slate-600 font-medium mb-1">
                      <MapPin size={18} className="text-slate-300" />
                      <span className="truncate">{aktivitet.sted}</span>
                    </div>

                    {/* Deltakere */}
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Users size={16} className="text-slate-300" />
                      <span>
                        {aktivitet.max_deltakere 
                          ? `${aktivitet.max_deltakere} plasser` 
                          : 'Ingen begrensning'}
                      </span>
                    </div>
                  </div>

                  {/* "Les mer" pil som dukker opp ved hover */}
                  <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                    <div className="bg-slate-50 p-2 rounded-full text-slate-900">
                      <ArrowRight size={20} />
                    </div>
                  </div>

                </div>
              </Link>
            ))}
            </div>
          </div>
        )}

        <div className="mt-24 text-center">
          <p className="text-slate-500 mb-6 text-lg">Vil du arrangere noe selv?</p>
          <Link href="/login" className="inline-block bg-slate-100 text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-colors">
            Lag en aktivitet
          </Link>
        </div>

      </section>

      {/* --- ENKEL FOOTER --- */}
      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© 2025 NyeVenner</p>
      </footer>
    </div>
  )
}