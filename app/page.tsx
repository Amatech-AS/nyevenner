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
    <div className="min-h-screen pb-24">
      
      {/* HEADER - Flytende hvit stripe */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-3xl">👋</span> NyeVenner
          </h1>
          <Link href="/login" className="btn-primary py-2 px-6 text-sm">
            Logg inn
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* SØKEFELT - Sentrert og lekkert */}
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-4xl font-black text-slate-800 mb-6">Hva vil du finne på?</h2>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-slate-400" />
            </div>
            <input 
              type="text"
              value={soketekst}
              onChange={(e) => setSoketekst(e.target.value)}
              placeholder="Søk etter aktivitet eller sted..."
              className="w-full p-5 pl-12 rounded-2xl shadow-xl border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 text-lg outline-none transition-all"
            />
          </div>
        </div>

        {/* LASTE-SPINNER */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          
          /* AKTIVITETS-GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group h-full">
                
                {/* KORTET - Whamageddon stil (Hvit boks med skygge) */}
                <div className="card h-full flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                  
                  {/* Bilde - Lite og avlangt (Header) */}
                  <div className="h-32 w-full bg-slate-200 relative">
                    <img 
                      src={aktivitet.image_url || 'https://images.unsplash.com/photo-1523301343968-63214359d56b?q=80&w=400'} 
                      alt=""
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Dato-tag */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm uppercase tracking-wide">
                      {aktivitet.dato.split(' ')[0]}
                    </div>
                  </div>

                  {/* Tekst - Rent og pent med god padding */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {aktivitet.tittel}
                    </h3>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin size={16} className="shrink-0 text-slate-400" />
                        <span className="truncate">{aktivitet.sted}</span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                          <Users size={14} />
                          {aktivitet.max_deltakere ? `${aktivitet.max_deltakere} plasser` : 'Åpent'}
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* FLYTENDE KNAPP */}
      <div className="fixed bottom-8 right-8 z-40">
        <Link href="/ny-aktivitet" className="btn-primary rounded-full py-4 px-8 shadow-2xl text-lg">
          + Lag ny
        </Link>
      </div>

    </div>
  )
}
