'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Search, Users, ArrowRight, Heart } from 'lucide-react'

type Aktivitet = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string }

export default function LandingPage() {
  const supabase = createClient()
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hentSisteAktiviteter() {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(9) // Viser 9 stk som Finn.no rutenett
      
      if (data) setAktiviteter(data)
      setLoading(false)
    }
    hentSisteAktiviteter()
  }, [])

  // Smart bildevelger (Finn.no stil - alle annonser må ha bilde)
  const getImageForActivity = (tittel: string) => {
    const t = tittel.toLowerCase()
    // Bruker Unsplash Source for varierte bilder
    if (t.includes('tur') || t.includes('gå')) return 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
    if (t.includes('kaffe') || t.includes('mat')) return 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80'
    if (t.includes('strikk') || t.includes('hobby')) return 'https://images.unsplash.com/photo-1606105886470-8b1e10222045?w=800&q=80'
    if (t.includes('kino') || t.includes('kultur')) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80'
    if (t.includes('hage')) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80'
    // Default sosialt bilde
    return 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80'
  }

  return (
    <div className="min-h-screen">
      
      {/* --- HEADER (Finn.no stil: Ren og hvit) --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-blue-600 tracking-tight">
              NyeVenner
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-700 font-medium hover:text-blue-600 transition-colors hidden sm:block">
              Logg inn
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Ny bruker
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO (Match.com stil: Stort bilde med søkeboks) --- */}
      <div className="relative h-[550px] w-full bg-slate-900">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1567083437158-406a35a77146?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60"
            alt="Eldre par på tur"
          />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-md">
            Finn noen å dele hverdagen med
          </h1>
          <p className="text-xl text-gray-100 mb-10 max-w-2xl font-medium drop-shadow-md">
            Tusenvis av aktive seniorer bruker NyeVenner til å finne turfølge, kaffever venner og kjærester.
          </p>

          {/* Søkeboks ala Finn.no / Match */}
          <div className="bg-white p-2 rounded-full shadow-2xl flex w-full max-w-2xl transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex-1 flex items-center px-6 border-r border-gray-200">
              <MapPin className="text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Hvor bor du? (f.eks Trondheim)" 
                className="w-full py-4 outline-none text-gray-700 text-lg bg-transparent"
              />
            </div>
            <Link href="/login" className="bg-blue-600 text-white px-8 md:px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors flex items-center">
              Søk <span className="hidden md:inline ml-2">nå</span>
            </Link>
          </div>
          
          <div className="mt-8 flex gap-8 text-white/90 font-medium text-sm md:text-base animate-fade-in-up">
            <span className="flex items-center gap-2"><Users size={18} /> 100% Ekte profiler</span>
            <span className="flex items-center gap-2"><Heart size={18} /> Trygt og sikkert</span>
            <span className="flex items-center gap-2"><Calendar size={18} /> Aktiviteter hver dag</span>
          </div>
        </div>
      </div>

      {/* --- AKTIVITETER (Finn.no stil: Kort-rutenett) --- */}
      <section className="bg-[#F3F4F6] py-20">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Aktiviteter i nærheten</h2>
            <Link href="/login" className="text-blue-600 font-bold hover:underline flex items-center">
              Se alle 42 aktiviteter <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white h-80 rounded-lg animate-pulse shadow-sm"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {aktiviteter.map((aktivitet) => (
                <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 group-hover:-translate-y-1">
                    
                    {/* Bilde i toppen (Finn-stil) */}
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={getImageForActivity(aktivitet.tittel)} 
                        alt={aktivitet.tittel}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                        Aktivitet
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {aktivitet.tittel}
                      </h3>
                      
                      <div className="flex flex-col gap-2 mt-auto text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="truncate">{aktivitet.sted}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span>{aktivitet.dato}</span>
                        </div>
                      </div>

                      {/* "CTA" knapp som ligner på Finn/Møteplassen handling */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-blue-600 font-bold text-sm">Les mer</span>
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 bg-blue-900 rounded-2xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Savner du noen å snakke med?</h3>
              <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
                Det er helt gratis å lage en profil. Bli med over 15 000 andre nordmenn som har funnet fellesskapet på NyeVenner.
              </p>
              <Link href="/login" className="inline-block bg-white text-blue-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Registrer deg gratis
              </Link>
            </div>
            {/* Dekor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </section>

      {/* --- FOOTER (Enkel og ren) --- */}
      <footer className="bg-white py-12 border-t border-gray-200 text-center">
        <h2 className="text-2xl font-black text-blue-900 mb-6">NyeVenner</h2>
        <div className="flex justify-center gap-8 text-gray-500 font-medium mb-8">
          <a href="#" className="hover:text-blue-600">Om oss</a>
          <a href="#" className="hover:text-blue-600">Sikkerhet</a>
          <a href="#" className="hover:text-blue-600">Kundeservice</a>
        </div>
        <p className="text-gray-400 text-sm">© 2025 Amatech AS. En del av fellesskapet.</p>
      </footer>
    </div>
  )
}