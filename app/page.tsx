'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Search, Users, ArrowRight, Loader2 } from 'lucide-react'

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
      // Henter 12 aktiviteter
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

  // Pastell-farger (Myke bakgrunner på kortene)
  const getPastelTheme = (index: number) => {
    const themes = [
      'bg-rose-50/50 hover:bg-rose-50 border-rose-100',
      'bg-blue-50/50 hover:bg-blue-50 border-blue-100',
      'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100',
      'bg-amber-50/50 hover:bg-amber-50 border-amber-100',
      'bg-violet-50/50 hover:bg-violet-50 border-violet-100',
      'bg-cyan-50/50 hover:bg-cyan-50 border-cyan-100',
    ]
    return themes[index % themes.length]
  }

  return (
    <div className="min-h-screen pb-20 bg-[#FDNCFB]"> {/* Varm hvit bakgrunn */}
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tight text-slate-800">
            NyeVenner
          </Link>
          <Link 
            href="/login" 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform"
          >
            Logg inn
          </Link>
        </div>
      </nav>

      {/* HERO / SØK */}
      <div className="px-4 py-12 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Aktiviteter for deg
        </h1>
        <p className="text-slate-500 text-lg mb-8">
          Finn noen å dele opplevelser med. Trygt, enkelt og lokalt.
        </p>

        {/* Søkefelt */}
        <div className="relative max-w-lg mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-blue-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white rounded-full p-2 flex items-center shadow-xl shadow-slate-200/50 border border-gray-100">
            <Search className="ml-4 text-slate-400" size={20} />
            <input 
              type="text"
              value={soketekst}
              onChange={(e) => setSoketekst(e.target.value)}
              placeholder="Søk etter aktivitet..."
              className="w-full py-3 px-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* AKTIVITETSLISTE */}
      <section className="px-4 md:px-8 max-w-[1600px] mx-auto">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={40} />
          </div>
        ) : aktiviteter.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Ingen aktiviteter funnet.</div>
        ) : (
          /* RESPONSIVT RUTENETT: 1 på mobil, 2 på brett, 4 på PC */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {aktiviteter.map((aktivitet, index) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group h-full">
                
                {/* FLISEN */}
                <div className={`h-full rounded-[2rem] overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col ${getPastelTheme(index)}`}>
                  
                  {/* BILDE (Liten header, h-28 = 112px) */}
                  <div className="h-28 w-full bg-white relative overflow-hidden">
                    <img 
                      src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600'} 
                      alt={aktivitet.tittel}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Dato-tag (Liten og diskret) */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm flex items-center gap-1">
                      <Calendar size={10} /> {aktivitet.dato.split(' ')[0]}
                    </div>
                  </div>

                  {/* TEKST (Får nå mest plass) */}
                  <div className="p-5 flex flex-col flex-1">
                    
                    {/* Tittel */}
                    <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight group-hover:text-black transition-colors">
                      {aktivitet.tittel}
                    </h3>

                    {/* Sted (Mindre tekst) */}
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium mb-4">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{aktivitet.sted}</span>
                    </div>

                    <div className="mt-auto pt-3 border-t border-black/5 flex justify-between items-center">
                      
                      {/* Antall deltakere */}
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                        <Users size={14} />
                        <span>
                          {aktivitet.max_deltakere 
                            ? `${aktivitet.max_deltakere} plasser` 
                            : 'Åpent for alle'}
                        </span>
                      </div>

                      {/* Pil */}
                      <div className="bg-white p-1.5 rounded-full text-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                        <ArrowRight size={16} />
                      </div>
                    </div>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Lag Aktivitet Knapp */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-black hover:scale-105 transition-all flex items-center gap-2"
        >
          + Lag aktivitet
        </Link>
      </div>

    </div>
  )
}