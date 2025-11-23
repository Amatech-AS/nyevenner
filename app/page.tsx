'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Search, ArrowRight, Users, Loader2 } from 'lucide-react'

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
        .limit(12)
      
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
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      
      {/* --- HEADER (Kompakt) --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            NyeVenner
          </Link>
          
          {/* Søkefelt i header (Sparer plass) */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-slate-300 focus-within:bg-white transition-all">
            <Search size={18} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              value={soketekst}
              onChange={(e) => setSoketekst(e.target.value)}
              placeholder="Søk etter aktiviteter..." 
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>

          <Link href="/login" className="text-sm font-bold text-slate-700 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
            Logg inn
          </Link>
        </div>
      </nav>

      {/* --- SØK FOR MOBIL (Vises kun på liten skjerm) --- */}
      <div className="md:hidden px-4 py-4 border-b border-gray-100">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
          <Search size={18} className="text-slate-400 mr-3" />
          <input 
            type="text" 
            value={soketekst}
            onChange={(e) => setSoketekst(e.target.value)}
            placeholder="Søk..." 
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* --- INNHOLD --- */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Aktiviteter</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={32} />
          </div>
        ) : aktiviteter.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            Ingen aktiviteter funnet.
          </div>
        ) : (
          /* 
             RUTENETT: 
             - Mobil: 1 kolonne
             - Tablet: 2 kolonner
             - Liten Laptop: 3 kolonner
             - Stor Skjerm: 4 kolonner (Airbnb standard)
          */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group cursor-pointer block">
                
                {/* BILDE - Kompakt format (4:3 ratio) */}
                <div className="relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden mb-3">
                  <img 
                    src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600'} 
                    alt={aktivitet.tittel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dato-tag (Liten og diskret oppe i hjørnet) */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
                    {aktivitet.dato.split(' ')[0]}
                  </div>
                </div>

                {/* TEKST - Under bildet (Airbnb stil) */}
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:underline decoration-2 underline-offset-4 decoration-slate-900">
                      {aktivitet.tittel}
                    </h3>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-1 truncate">
                    {aktivitet.sted}
                  </p>
                  
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <Calendar size={14} />
                    {aktivitet.dato}
                  </p>

                  {/* Status på plasser */}
                  <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1">
                    {aktivitet.max_deltakere 
                      ? <><Users size={12}/> {aktivitet.max_deltakere} plasser totalt</> 
                      : 'Åpent for alle'}
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Flytende Knapp (Diskret) */}
      <div className="fixed bottom-8 right-8 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm"
        >
          + Lag aktivitet
        </Link>
      </div>

    </div>
  )
}