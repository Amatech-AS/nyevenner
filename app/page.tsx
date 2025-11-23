'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Search, Users, ArrowRight, Loader2 } from 'lucide-react'

type Aktivitet = { 
  id: string; 
  tittel: string; 
  beskrivelse: string; 
  dato: string; 
  sted: string;
  max_deltakere: number | null;
  image_url: string | null;
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
        .limit(12) // Henter 12 stk
      
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="text-blue-600">🤝</span> NyeVenner
          </Link>
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Logg inn
          </Link>
        </div>
      </nav>

      {/* --- HERO / SØK --- */}
      <div className="bg-white py-16 px-6 text-center border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Finn aktiviteter <br className="hidden md:block" />i ditt nabolag
          </h1>
          
          {/* Søkefelt (SuperTrouper stil: Enkel og ren) */}
          <div className="relative max-w-lg mx-auto mt-8">
            <input 
              type="text"
              value={soketekst}
              onChange={(e) => setSoketekst(e.target.value)}
              placeholder="Søk etter aktivitet eller sted..."
              className="w-full py-4 pl-6 pr-14 bg-gray-100 rounded-full text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all border border-transparent"
            />
            <div className="absolute right-2 top-2 p-2 bg-blue-600 rounded-full text-white">
              <Search size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* --- AKTIVITETSLISTE (SuperTrouper Grid) --- */}
      <section className="px-6 py-16 max-w-[1400px] mx-auto">
        
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Oppdag nye aktiviteter</h2>
          <span className="text-slate-500 text-sm font-medium">{aktiviteter.length} treff</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={40} />
          </div>
        ) : aktiviteter.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-slate-400 text-lg">Ingen aktiviteter funnet.</p>
            <button onClick={() => setSoketekst('')} className="mt-2 text-blue-600 font-bold hover:underline">Nullstill</button>
          </div>
        ) : (
          /* RUTENETTET: SuperTrouper bruker ofte 4 i bredden på desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group flex flex-col cursor-pointer">
                
                {/* BILDE - Høyt format (Portrait / 3:4 aspect ratio) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-200 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <img 
                    src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600'} 
                    alt={aktivitet.tittel}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Dato-badge (Ligner på "Kategori"-taggen til SuperTrouper) */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm">
                    {aktivitet.dato.split(' ')[0]}
                  </div>

                  {/* "Ledige plasser" badge nede */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Users size={12} />
                    {aktivitet.max_deltakere ? `${aktivitet.max_deltakere} plasser` : 'Åpent'}
                  </div>
                </div>

                {/* TEKST - Rent under bildet */}
                <div className="px-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors">
                    {aktivitet.tittel}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{aktivitet.sted}</span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Flytende Knapp */}
      <div className="fixed bottom-8 right-8 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="bg-slate-900 text-white px-6 py-4 rounded-full font-bold shadow-2xl hover:bg-blue-600 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="text-2xl leading-none font-light mb-1">+</span> <span className="text-sm">Lag aktivitet</span>
        </Link>
      </div>

    </div>
  )
}