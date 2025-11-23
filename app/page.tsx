'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Users, Loader2 } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hentData() {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)
      
      if (data) setAktiviteter(data)
      setLoading(false)
    }
    hentData()
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      
      {/* HEADER - Enkel og ren */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NyeVenner
          </h1>
          <Link href="/login" className="text-sm font-bold bg-slate-100 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-colors">
            Logg inn
          </Link>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Oppdag aktiviteter</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={32} />
          </div>
        ) : (
          /* 
             HER ER RUTENETTET SOM TVINGER 4 I BREDDEN PÅ PC
             grid-cols-1 = Mobil
             sm:grid-cols-2 = Nettbrett
             lg:grid-cols-4 = PC (Supertrouper stil)
          */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group block">
                
                {/* 1. BILDET - LÅST HØYDE (h-48 = ca 200px). Blir aldri større enn dette. */}
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
                  <img 
                    src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600'} 
                    alt={aktivitet.tittel}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Dato-tag oppå bildet */}
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-xs font-bold text-slate-900 shadow-sm">
                    {aktivitet.dato.split(' ')[0]}
                  </div>
                </div>

                {/* 2. TEKST - FOKUS HER */}
                <div>
                  {/* Tittel: Stor og fet */}
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:underline decoration-2 underline-offset-4">
                    {aktivitet.tittel}
                  </h3>
                  
                  {/* Info-linje: Sted */}
                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                    <MapPin size={14} />
                    <span className="truncate font-medium">{aktivitet.sted}</span>
                  </div>

                  {/* Info-linje: Tid og Plasser */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{aktivitet.dato.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{aktivitet.max_deltakere ? `${aktivitet.max_deltakere} plasser` : 'Åpent'}</span>
                    </div>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Flytende knapp nede i hjørnet */}
      <div className="fixed bottom-8 right-8 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="bg-black text-white px-6 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
        >
          + Lag aktivitet
        </Link>
      </div>

    </div>
  )
}