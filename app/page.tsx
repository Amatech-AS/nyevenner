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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      
      {/* --- FLOWBITE NAVBAR --- */}
      <nav className="bg-white border-gray-200 border-b sticky top-0 z-50">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-extrabold whitespace-nowrap text-blue-700">
              NyeVenner
            </span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <Link 
              href="/login" 
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Logg inn
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HEADER / SØK --- */}
      <section className="bg-white border-b border-gray-200 py-12 px-4">
        <div className="max-w-screen-xl mx-auto text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl">
            Finn aktiviteter nær deg
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48">
            En enkel oversikt over hva som skjer. Ingen forpliktelser, bare hyggelige folk.
          </p>
          
          {/* Flowbite Search Input */}
          <div className="max-w-md mx-auto">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Søk</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="search" 
                id="default-search" 
                value={soketekst}
                onChange={(e) => setSoketekst(e.target.value)}
                className="block w-full p-4 ps-10 text-lg text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Søk etter tur, kaffe, sted..." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- LISTE (Flowbite Cards) --- */}
      <main className="max-w-screen-xl mx-auto px-4 py-12">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Kommende aktiviteter</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={40} />
          </div>
        ) : (
          /* 
             GRID LAYOUT:
             - Mobil: 1 kolonne (store, tydelige kort)
             - Nettbrett: 2 kolonner
             - PC: 4 kolonner (som du ønsket)
          */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group h-full">
                
                {/* FLOWBITE CARD */}
                <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 hover:shadow-lg transition-all duration-200">
                  
                  {/* BILDE - VELDIG LITE/LAVT (h-28 = 112px) */}
                  {/* Dette fungerer som en liten dekorativ header */}
                  <div className="h-28 w-full overflow-hidden rounded-t-lg relative bg-gray-100">
                    <img 
                      className="w-full h-full object-cover opacity-90" 
                      src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400'} 
                      alt="" 
                    />
                    {/* Dato Badge */}
                    <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-400">
                      {aktivitet.dato ? aktivitet.dato.split(' ')[0] : 'Dato'}
                    </span>
                  </div>

                  {/* INNHOLD - FOKUS PÅ TEKST */}
                  <div className="p-5 flex flex-col flex-1">
                    
                    {/* Tittel - Stor og fet */}
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700 leading-tight line-clamp-2">
                      {aktivitet.tittel}
                    </h5>
                    
                    <div className="mt-auto space-y-3">
                      {/* Sted - Tydelig tekst */}
                      <p className="font-normal text-gray-700 flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-500 shrink-0" />
                        <span className="truncate">{aktivitet.sted}</span>
                      </p>

                      {/* Dato og Tid - Tydelig tekst */}
                      <p className="font-normal text-gray-700 flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-500 shrink-0" />
                        <span>{aktivitet.dato ? aktivitet.dato.split(',')[0] : ''}</span>
                      </p>

                      {/* Plasser */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-3 text-sm font-medium text-gray-600">
                        <Users size={16} />
                        <span>
                          {aktivitet.max_deltakere ? `${aktivitet.max_deltakere} plasser` : 'Åpent for alle'}
                        </span>
                      </div>
                    </div>

                    {/* Knapp - Flowbite stil */}
                    <div className="mt-4 inline-flex items-center font-medium text-blue-600 hover:underline">
                      Les mer
                      <ArrowRight size={16} className="ms-2 rtl:rotate-180" />
                    </div>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* FAB (Floating Action Button) */}
      <div className="fixed bottom-6 end-6 z-50">
        <Link 
          href="/ny-aktivitet" 
          className="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none shadow-lg transition-transform hover:scale-110"
        >
          <span className="text-3xl font-light mb-1">+</span>
          <span className="sr-only">Ny aktivitet</span>
        </Link>
      </div>

    </div>
  )
}