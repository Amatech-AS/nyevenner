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
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* Header */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tight">NyeVenner</h1>
          <Link href="/login" className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-full">
            Logg inn
          </Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Kommende aktiviteter</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-slate-300" />
          </div>
        ) : (
          /* 
             RUTENETT:
             Vi bruker 'grid-cols-2' på mobil (små kort)
             og 'lg:grid-cols-4' på PC (4 i bredden).
          */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group block">
                
                <div className="flex flex-col h-full">
                  
                  {/* 
                      BILDE - TVUNGET LITEN HØYDE 
                      h-[180px] betyr nøyaktig 180 piksler høyt.
                      Det kan umulig dekke hele skjermen med denne koden.
                  */}
                  <div className="relative w-full h-[180px] rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img 
                      src={aktivitet.image_url || 'https://images.unsplash.com/photo-1523301343968-63214359d56b?q=80&w=600'} 
                      alt="Aktivitet"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Dato-tag */}
                    <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm">
                      {aktivitet.dato ? aktivitet.dato.split(' ')[0] : 'Dato'}
                    </div>
                  </div>

                  {/* TEKST - Dette er viktigst */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600">
                      {aktivitet.tittel}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
                      <MapPin size={12} />
                      <span className="truncate font-medium">{aktivitet.sted}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-50 pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {aktivitet.dato ? aktivitet.dato.split(',')[0] : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {aktivitet.max_deltakere ? `${aktivitet.max_deltakere} plasser` : 'Åpent'}
                      </span>
                    </div>
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
          + Lag aktivitet
        </Link>
      </div>

    </div>
  )
}