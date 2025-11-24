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
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      
      {/* HEADER */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tight">NyeVenner</h1>
          <Link href="/login" className="text-sm font-bold bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition-opacity">
            Logg inn
          </Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Aktiviteter</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={32} />
          </div>
        ) : (
          /* 
             HER ER ENDRINGEN:
             grid-cols-2 = Alltid minst 2 ved siden av hverandre (også mobil!)
             md:grid-cols-3 = 3 på nettbrett
             lg:grid-cols-4 = 4 på PC
             gap-4 = Litt tettere mellomrom, ser mer ut som et rutenett
          */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group flex flex-col">
                
                {/* BILDE - Fast størrelse, men bredden styres av rutenettet (som nå er delt på 2 eller 4) */}
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 mb-3">
                  <img 
                    src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600'} 
                    alt={aktivitet.tittel}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Liten datolapp */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-slate-900 shadow-sm">
                    {aktivitet.dato ? aktivitet.dato.split(' ')[0] : 'Dato'}
                  </div>
                </div>

                {/* TEKST - Kompakt og tydelig under bildet */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm md:text-base font-bold text-slate-900 leading-tight group-hover:underline decoration-2 underline-offset-2 line-clamp-1">
                    {aktivitet.tittel}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{aktivitet.sted}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded">
                      <Calendar size={10} />
                      {aktivitet.dato ? aktivitet.dato.split(',')[0] : ''}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded">
                      <Users size={10} />
                      {aktivitet.max_deltakere ? `${aktivitet.max_deltakere}` : 'Åpent'}
                    </span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Flytende knapp */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="bg-black text-white px-5 py-3 rounded-full font-bold shadow-lg text-sm flex items-center gap-2 hover:scale-105 transition-transform"
        >
          + Lag ny
        </Link>
      </div>

    </div>
  )
}