'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Search, Users, ArrowRight, Sparkles, Filter } from 'lucide-react'

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
    <div className="min-h-screen pb-20 font-sans">
      
      {/* --- HEADER (Minimalistisk) --- */}
      <nav className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-stone-900 text-white p-2 rounded-xl">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">
              NyeVenner
            </span>
          </div>
          <Link 
            href="/login" 
            className="text-stone-900 font-bold hover:opacity-70 transition-opacity text-sm"
          >
            Logg inn
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION (Stor tekst + Søk) --- */}
      <section className="pt-32 pb-16 px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-end justify-between">
          
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-widest mb-6">
              Møteplassen 2025
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-stone-900 leading-[0.95] tracking-tight mb-8">
              Finn din neste <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                hverdagsglede.
              </span>
            </h1>
            <p className="text-xl text-stone-500 max-w-lg leading-relaxed">
              Ingen store forpliktelser. Bare hyggelige folk som vil finne på noe sammen i ditt nabolag.
            </p>
          </div>

          {/* SØKEBOKS (Stor og tydelig) */}
          <div className="w-full lg:w-auto flex-1 max-w-xl">
            <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-stone-200/50 border border-stone-100 flex items-center">
              <div className="pl-6 text-stone-400">
                <Search size={24} />
              </div>
              <input 
                type="text"
                value={soketekst}
                onChange={(e) => setSoketekst(e.target.value)}
                placeholder="Hva vil du gjøre? (f.eks. Tur)"
                className="w-full py-4 px-4 bg-transparent outline-none text-stone-800 text-lg placeholder:text-stone-400 font-medium"
              />
              <button className="bg-stone-900 text-white p-4 rounded-[1.5rem] hover:bg-stone-800 transition-colors hidden sm:block">
                <Filter size={20} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* --- AKTIVITETSKORT (Grid) --- */}
      <section className="px-6 max-w-[1600px] mx-auto">
        
        <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
          <h2 className="text-2xl font-bold text-stone-900">
            Kommende aktiviteter
          </h2>
          <span className="text-stone-400 text-sm font-medium bg-stone-100 px-3 py-1 rounded-full">
            {aktiviteter.length} treff
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-stone-200 rounded-[2rem] animate-pulse"></div>)}
          </div>
        ) : aktiviteter.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-stone-100">
            <p className="text-stone-400 text-xl">Vi fant ingen aktiviteter akkurat nå.</p>
            <button onClick={() => setSoketekst('')} className="mt-4 text-orange-600 font-bold underline">Nullstill søk</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {aktiviteter.map((aktivitet, index) => {
              // Vi roterer litt på bakgrunnsfargen for å skape liv
              const colors = ['bg-orange-50', 'bg-blue-50', 'bg-emerald-50', 'bg-purple-50', 'bg-pink-50'];
              const bgColor = colors[index % colors.length];

              return (
                <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group h-full">
                  <div className="bg-white rounded-[2.5rem] p-3 border border-stone-100 hover:border-stone-300 transition-all duration-300 hover:shadow-2xl hover:shadow-stone-200/50 hover:-translate-y-1 h-full flex flex-col">
                    
                    {/* Bilde-seksjon (Liten og avrundet) */}
                    <div className="relative h-40 w-full overflow-hidden rounded-[2rem] mb-4">
                      <img 
                        src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600'} 
                        alt={aktivitet.tittel}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Dato-tag flytende oppå bildet */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-900 shadow-sm flex flex-col items-center leading-tight">
                        <span className="text-[10px] text-stone-500">{aktivitet.dato.split(' ')[0]}</span>
                        <span className="text-base">{aktivitet.dato.split(' ')[1].replace('.', '')}</span>
                      </div>
                    </div>

                    {/* Innhold */}
                    <div className="px-3 pb-3 flex flex-col flex-1">
                      
                      {/* Tittel */}
                      <h3 className="text-xl font-bold text-stone-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                        {aktivitet.tittel}
                      </h3>

                      {/* Info-rad */}
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center gap-2 text-stone-600 text-sm font-medium bg-stone-50 p-2 rounded-xl">
                          <MapPin size={16} className="text-stone-400 shrink-0" />
                          <span className="truncate">{aktivitet.sted}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-stone-50">
                          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold">
                            <Users size={14} />
                            <span>
                              {aktivitet.max_deltakere 
                                ? `${aktivitet.max_deltakere} plasser` 
                                : 'Åpent for alle'}
                            </span>
                          </div>

                          <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Flytende Knapp */}
      <div className="fixed bottom-8 right-8 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="text-2xl font-light leading-none mb-1">+</span> Lag aktivitet
        </Link>
      </div>

    </div>
  )
}