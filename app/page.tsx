'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, ArrowRight, Heart, Users, ShieldCheck, ArrowUpRight } from 'lucide-react'

type Aktivitet = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string }

export default function LandingPage() {
  const supabase = createClient()
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hentSisteAktiviteter() {
      // Hent de 6 nyeste aktivitetene
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)
      
      if (data) setAktiviteter(data)
      setLoading(false)
    }
    hentSisteAktiviteter()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      
      {/* --- HEADER / MENY --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Users size={24} />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                NyeVenner
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 font-bold hover:text-blue-600 transition-colors hidden md:block">
                Logg inn
              </Link>
              <Link 
                href="/login" 
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
              >
                Kom i gang <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SEKSJON (Blikkfang) --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm mb-6 animate-fade-in-up">
              ✨ Norges hyggeligste møteplass
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Gjør hverdagen <span className="text-blue-600">rikere</span> med nye venner.
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Finn noen å gå tur med, drikke kaffe med, eller bare slå av en prat. 
              Enkelt, trygt og helt gratis å bruke.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-blue-700 transition-transform hover:-translate-y-1">
                Opprett gratis profil
              </Link>
              <a href="#aktiviteter" className="px-8 py-4 bg-white text-slate-700 border border-gray-200 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-colors">
                Se hva som skjer
              </a>
            </div>
          </div>

          {/* Bildegalleri / Visuals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 relative group">
              <img src="https://images.unsplash.com/photo-1571221715454-da8c31278c6e?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Eldre på tur" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-bold text-lg">Gå turer sammen</p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 relative group md:-mt-10">
              <img src="https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Venner som ler" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-bold text-lg">Sosiale treff</p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 relative group">
              <img src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Hobby og aktivitet" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-bold text-lg">Del hobbyer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FORDELER --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-green-600 mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-bold">Finn fellesskap</h3>
              <p className="text-gray-600">Ensomhet er kjedelig. Her finner du andre som ønsker akkurat det samme som deg.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-purple-600 mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold">Trygt og enkelt</h3>
              <p className="text-gray-600">Vi har laget siden spesielt for at den skal være enkel å bruke, med stor tekst og tydelige knapper.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-orange-600 mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold">For pårørende også</h3>
              <p className="text-gray-600">Familien kan enkelt koble seg til for å hjelpe til med å organisere hverdagen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIVE AKTIVITETS-FEED --- */}
      <section id="aktiviteter" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Akkurat nå</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Siste aktiviteter</h2>
            </div>
            <Link href="/login" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:underline">
              Se alle aktiviteter <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Laster aktiviteter...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aktiviteter.map((aktivitet) => (
                <div key={aktivitet.id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      Aktivitet
                    </span>
                    <Link href={`/aktivitet/${aktivitet.id}`} className="p-2 bg-gray-50 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors">
                      <ArrowUpRight size={20} />
                    </Link>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {aktivitet.tittel}
                  </h3>
                  
                  <div className="mt-auto space-y-3 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Calendar size={18} className="text-blue-400" />
                      <span className="font-medium">{aktivitet.dato}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin size={18} className="text-red-400" />
                      <span className="font-medium truncate">{aktivitet.sted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/login" className="inline-block bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-black transition-colors">
              Logg inn for å bli med
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-4">
            NyeVenner
          </h2>
          <p className="text-gray-500 mb-8">Laget med omtanke for fellesskapet ❤️</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <span>© 2025 Amatech AS</span>
            <span>Personvern</span>
            <span>Kontakt oss</span>
          </div>
        </div>
      </footer>

    </div>
  )
}