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
        .limit(12) // 12 aktiviteter gir 3 pene rader på PC
      
      if (data) setAktiviteter(data)
      setLoading(false)
    }
    hentData()
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      
      {/* HEADER */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tight">NyeVenner</h1>
          <Link href="/login" className="text-xs font-bold bg-black text-white px-4 py-2 rounded-full">
            Logg inn
          </Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        
        <h2 className="text-xl font-bold mb-6 text-slate-900">Aktiviteter</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-slate-300" size={24} />
          </div>
        ) : (
          /* 
             RUTENETT (GRID):
             grid-cols-2 = 2 fliser i bredden på MOBIL (smått!)
             md:grid-cols-3 = 3 på nettbrett
             lg:grid-cols-4 = 4 på PC
             gap-3 = Tett mellomrom for å spare plass
          */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group flex flex-col">
                
                {/* 
                    BILDE - LITEN STRIPE
                    aspect-video (16:9) gjør bildet lavt og bredt, ikke høyt.
                    rounded-md = lett avrundet, ikke store bobler.
                */}
                <div className="relative w-full aspect-video overflow-hidden rounded-md bg-gray-100 mb-2">
                  <img 
                    src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400'} 
                    alt={aktivitet.tittel}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Dato - Liten tekst oppå bildet */}
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {aktivitet.dato ? aktivitet.dato.split(' ')[0] : 'Dato'}
                  </div>
                </div>

                {/* TEKST - FOKUSOMRÅDET */}
                <div className="flex flex-col">
                  {/* Tittel: Tykk og tydelig */}
                  <h3 className="text-sm md:text-base font-black text-slate-900 leading-tight mb-1 line-clamp-2 group-hover:underline">
                    {aktivitet.tittel}
                  </h3>
                  
                  {/* Sted: Mindre og grått */}
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1.5">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{aktivitet.sted}</span>
                  </div>

                  {/* Detaljer: Minst viktig, nederst */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 mt-auto">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Calendar size={10} />
                      <span>{aktivitet.dato ? aktivitet.dato.split(',')[0] : ''}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Users size={10} />
                      <span>{aktivitet.max_deltakere ? `${aktivitet.max_deltakere} pl.` : 'Åpent'}</span>
                    </div>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Knapp */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="bg-black text-white px-5 py-3 rounded-full font-bold shadow-lg text-sm flex items-center gap-2"
        >
          + Lag ny
        </Link>
      </div>

    </div>
  )
}