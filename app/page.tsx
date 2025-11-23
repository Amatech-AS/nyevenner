'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, ArrowRight, Heart, Shield, Users, Sparkles } from 'lucide-react'

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
        .limit(6)
      
      if (data) setAktiviteter(data)
      setLoading(false)
    }
    hentSisteAktiviteter()
  }, [])

  return (
    <div className="min-h-screen text-slate-900">
      
      {/* --- HEADER --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-stone-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <Sparkles size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              NyeVenner
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden md:block text-slate-600 font-medium hover:text-slate-900 transition-colors">
              Logg inn
            </Link>
            <Link 
              href="/login" 
              className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
            >
              Kom i gang
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          <div className="relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-bold mb-8 border border-orange-100">
              <Heart size={14} className="fill-orange-700" /> Norges varmeste fellesskap
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 text-slate-900">
              Gjør hverdagen <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">litt rikere.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
              En trygg møteplass for deg som vil finne på noe hyggelig, møte nye fjes, eller bare ta en kopp kaffe i godt selskap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 text-center">
                Opprett profil gratis
              </Link>
              <a href="#aktiviteter" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-stone-50 transition-colors text-center">
                Se aktiviteter
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-100 to-amber-50 rounded-[3rem] blur-2xl opacity-50 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop" 
              alt="Fellesskap" 
              className="rounded-[2.5rem] shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700 w-full object-cover h-[500px]"
            />
            {/* Flytende kort */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs animate-bounce-slow">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-full text-green-700">
                  <MapPin size={16} />
                </div>
                <p className="font-bold text-slate-900">Søndagstur</p>
              </div>
              <p className="text-sm text-slate-500">"Noen som vil være med å gå rundt vannet?"</p>
            </div>
          </div>

        </div>
      </section>

      {/* --- VERDIER --- */}
      <section className="py-24 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                <Users />
              </div>
              <h3 className="text-xl font-bold">Ekte mennesker</h3>
              <p className="text-slate-600 leading-relaxed">Ingen roboter eller kompliserte algoritmer. Bare ekte folk i nabolaget ditt som ønsker kontakt.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                <Shield />
              </div>
              <h3 className="text-xl font-bold">Trygt og enkelt</h3>
              <p className="text-slate-600 leading-relaxed">Store knapper, tydelig tekst og norsk språk. Vi passer på at alle har det bra.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                <Heart />
              </div>
              <h3 className="text-xl font-bold">Familien med på laget</h3>
              <p className="text-slate-600 leading-relaxed">Pårørende kan enkelt kobles på for å hjelpe til med kalender og organisering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIVE AKTIVITETER --- */}
      <section id="aktiviteter" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <span className="text-orange-600 font-bold tracking-wider uppercase text-xs mb-2 block">Akkurat nå</span>
              <h2 className="text-4xl font-bold text-slate-900">Dette skjer i nærheten</h2>
            </div>
            <Link href="/login" className="group flex items-center gap-2 text-slate-900 font-bold hover:opacity-70 transition-opacity">
              Se alle aktiviteter <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aktiviteter.map((aktivitet, i) => (
                <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group">
                  <div className="bg-white rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-stone-100 hover:-translate-y-1">
                    
                    {/* Bilde-placeholder eller kart (Vi bruker en fin gradient her for clean look) */}
                    <div className={`h-40 w-full rounded-[1.2rem] mb-4 bg-gradient-to-br ${
                      i % 2 === 0 ? 'from-slate-100 to-stone-200' : 'from-orange-50 to-amber-50'
                    } flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity`}>
                      <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide text-slate-900 shadow-sm absolute bottom-4 left-4">
                        Aktivitet
                      </span>
                    </div>

                    <div className="px-5 pb-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {aktivitet.tittel}
                      </h3>
                      
                      <p className="text-slate-500 mb-6 line-clamp-2 text-sm leading-relaxed">
                        {aktivitet.beskrivelse}
                      </p>

                      <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                          <Calendar size={16} className="text-orange-500" />
                          <span>{aktivitet.dato}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="truncate">{aktivitet.sted}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/login" className="inline-block bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:bg-black hover:scale-105 transition-all">
              Bli med i fellesskapet
            </Link>
            <p className="mt-4 text-slate-500 text-sm">Det er helt gratis og uforpliktende.</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-16 border-t border-stone-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="text-slate-900" size={24} />
          <span className="text-2xl font-bold text-slate-900">NyeVenner</span>
        </div>
        <div className="flex justify-center gap-8 text-slate-500 font-medium mb-8">
          <Link href="#" className="hover:text-slate-900">Om oss</Link>
          <Link href="#" className="hover:text-slate-900">Trygghet</Link>
          <Link href="#" className="hover:text-slate-900">Kontakt</Link>
        </div>
        <p className="text-slate-400 text-sm">© 2025 Amatech AS. Laget med ❤️ i Trondheim.</p>
      </footer>

    </div>
  )
}