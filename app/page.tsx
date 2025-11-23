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
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tight text-blue-900">
            NyeVenner
          </Link>
          <Link 
            href="/login" 
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-700 transition-colors"
          >
            Logg inn
          </Link>
        </div>
      </nav>

      {/* --- HERO / SØK --- */}
      <div className="bg-white border-b border-gray-200 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Aktiviteter i ditt nabolag
          </h1>
          <p className="text-slate-500 text-lg mb-8">
            Finn noen å dele opplevelser med. Trygt, enkelt og lokalt.
          </p>

          {/* Søkefelt */}
          <div className="relative max-w-lg mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text"
              value={soketekst}
              onChange={(e) => setSoketekst(e.target.value)}
              placeholder="Søk etter sted eller aktivitet..."
              className="w-full py-4 pl-12 pr-4 bg-gray-100 rounded-full text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* --- AKTIVITETSLISTE --- */}
      <section className="px-4 sm:px-6 py-12 max-w-[1400px] mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Kommende aktiviteter</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={40} />
          </div>
        ) : aktiviteter.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-slate-400 text-lg">Vi fant ingen aktiviteter.</p>
            <button onClick={() => setSoketekst('')} className="mt-2 text-blue-600 font-bold hover:underline">Nullstill søk</button>
          </div>
        ) : (
          /* HER ER RUTENETTET: Garantert 4 på rad på stor skjerm */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group flex flex-col h-full">
                
                {/* KORTET */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                  
                  {/* BILDE - LÅST HØYDE (h-48 = 192px) */}
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <img 
                      src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600'} 
                      alt={aktivitet.tittel}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Dato-lapp (Liten og diskret) */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm flex items-center gap-1.5">
                      <Calendar size={12} className="text-blue-600" />
                      {aktivitet.dato.split(' ')[0]}
                    </div>
                  </div>

                  {/* TEKST - Under bildet */}
                  <div className="p-5 flex flex-col flex-1">
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                      {aktivitet.tittel}
                    </h3>

                    <div className="mt-auto space-y-3">
                      {/* Sted */}
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                        <MapPin size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{aktivitet.sted}</span>
                      </div>

                      {/* Footer i kortet */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-gray-50 px-2 py-1 rounded-md">
                          <Users size={14} />
                          <span>
                            {aktivitet.max_deltakere ? `${aktivitet.max_deltakere} plasser` : 'Åpent'}
                          </span>
                        </div>
                        
                        <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
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
          className="bg-blue-600 text-white px-6 py-4 rounded-full font-bold shadow-xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="text-2xl leading-none font-light mb-1">+</span> Lag aktivitet
        </Link>
      </div>

    </div>
  )
}