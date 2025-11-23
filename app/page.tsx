'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, ArrowRight, Search, Users } from 'lucide-react'

type Aktivitet = { 
  id: string; 
  tittel: string; 
  beskrivelse: string; 
  dato: string; 
  sted: string;
  max_deltakere: number | null;
}

export default function LandingPage() {
  const supabase = createClient()
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [alleAktiviteter, setAlleAktiviteter] = useState<Aktivitet[]>([]) // For søk
  const [soketekst, setSoketekst] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hentData() {
      // Vi henter 8 aktiviteter som bestilt
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)
      
      if (data) {
        setAktiviteter(data)
        setAlleAktiviteter(data)
      }
      setLoading(false)
    }
    hentData()
  }, [])

  // Enkel søkefunksjon
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
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* --- HEADER --- */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-blue-900 tracking-tight">
              NyeVenner
            </span>
          </div>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Logg inn
          </Link>
        </div>
      </nav>

      {/* --- HERO / SØK --- */}
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Finn noen å finne på noe med</h1>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          En enkel oversikt over hyggelige aktiviteter i ditt nærområde. Helt gratis.
        </p>

        {/* Stort søkefelt */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={24} />
          </div>
          <input 
            type="text"
            value={soketekst}
            onChange={(e) => setSoketekst(e.target.value)}
            placeholder="Søk etter sted (f.eks. Trondheim) eller aktivitet..."
            className="w-full pl-14 pr-6 py-5 rounded-full text-gray-900 text-xl font-medium outline-none shadow-xl focus:ring-4 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* --- AKTIVITETSLISTE --- */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Kommende aktiviteter</h2>
          <span className="text-gray-500 font-medium">Viser {aktiviteter.length} aktiviteter</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">Laster inn listen...</div>
        ) : aktiviteter.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-xl">Vi fant ingen aktiviteter som passet søket ditt.</p>
            <button onClick={() => setSoketekst('')} className="mt-4 text-blue-600 font-bold underline">
              Vis alle igjen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aktiviteter.map((aktivitet) => (
              <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex items-start gap-6 h-full">
                  
                  {/* Dato-boks (Veldig tydelig) */}
                  <div className="hidden sm:flex flex-col items-center justify-center bg-blue-50 text-blue-800 rounded-xl w-24 h-24 flex-shrink-0 border border-blue-100">
                    <Calendar size={24} className="mb-1 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Dato</span>
                    {/* Vi prøver å vise kort dato hvis mulig, ellers bare 'Se info' */}
                    <span className="text-sm font-bold text-center px-2 line-clamp-2 leading-tight">
                       {aktivitet.dato.split(' ')[0]} {/* Viser bare ukedagen/første ord for enkelhet */}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors leading-tight">
                      {aktivitet.tittel}
                    </h3>
                    
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-lg">
                        <MapPin size={20} className="text-red-500 flex-shrink-0" />
                        <span className="truncate font-medium">{aktivitet.sted}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={20} className="text-gray-400 sm:hidden flex-shrink-0" />
                        <span className="sm:hidden text-sm">{aktivitet.dato}</span>
                      </div>

                      {/* Info om deltakere */}
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <Users size={16} />
                        <span>
                          {aktivitet.max_deltakere 
                            ? `Plass til ${aktivitet.max_deltakere} personer` 
                            : 'Åpent for alle (Ingen begrensning)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="self-center bg-gray-50 p-3 rounded-full text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight size={24} />
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 text-center bg-blue-50 p-10 rounded-2xl border border-blue-100">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Vil du lage din egen aktivitet?</h3>
          <p className="text-blue-800 mb-6 text-lg">Det er helt gratis, og du bestemmer selv hvor mange som kan komme.</p>
          <Link href="/login" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-blue-700 shadow-lg">
            Opprett aktivitet
          </Link>
        </div>

      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 border-t border-gray-200 text-center mt-12">
        <p className="text-gray-400 font-medium">© 2025 NyeVenner - En møteplass for alle</p>
      </footer>
    </div>
  )
}