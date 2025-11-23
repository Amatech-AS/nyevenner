'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, ArrowRight, Coffee, Mountain, Music, Utensils, Heart, UserPlus, Sparkles, Footprints, Armchair } from 'lucide-react'

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

  // Hjelpefunksjon for å velge ikon og farge basert på aktivitetstittel
  const getCategoryStyle = (tittel: string) => {
    const t = tittel.toLowerCase()
    if (t.includes('tur') || t.includes('fjellet') || t.includes('gå')) return { icon: <Footprints size={32} />, color: 'bg-emerald-100 text-emerald-600' }
    if (t.includes('kaffe') || t.includes('lunsj') || t.includes('mat')) return { icon: <Coffee size={32} />, color: 'bg-amber-100 text-amber-700' }
    if (t.includes('strikk') || t.includes('hobby') || t.includes('bok')) return { icon: <Armchair size={32} />, color: 'bg-purple-100 text-purple-600' }
    if (t.includes('musikk') || t.includes('kino') || t.includes('konsert')) return { icon: <Music size={32} />, color: 'bg-rose-100 text-rose-600' }
    if (t.includes('middag') || t.includes('fest')) return { icon: <Utensils size={32} />, color: 'bg-orange-100 text-orange-600' }
    return { icon: <Sparkles size={32} />, color: 'bg-blue-100 text-blue-600' }
  }

  return (
    <div className="min-h-screen text-slate-900">
      
      {/* --- HEADER --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
              <UserPlus size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              NyeVenner
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block">
              Logg inn
            </Link>
            <Link 
              href="/login" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
            >
              Kom i gang
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SEKSJON --- */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Venstre side: Tekst */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
              <Heart size={12} className="fill-blue-700" /> Møteplassen for godt voksne
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
              Finn noen å dele <br/>
              <span className="text-blue-600">hverdagen</span> med.
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              Om du vil gå tur, ta en kaffe, eller bare slå av en prat – her finner du andre som ønsker akkurat det samme. Trygt, enkelt og lokalt.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 text-center">
                Opprett profil
              </Link>
              <a href="#aktiviteter" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors text-center">
                Se aktiviteter
              </a>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${40 + i}.jpg`} alt="Bruker" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p>Bli med over 500+ andre seniorer</p>
            </div>
          </div>

          {/* Høyre side: Bilde-collage */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1552089123-2d26226fc2b7?q=80&w=800&auto=format&fit=crop" 
                className="rounded-2xl shadow-xl h-64 w-full object-cover translate-y-8" 
                alt="Tur i skogen" 
              />
              <img 
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop" 
                className="rounded-2xl shadow-xl h-64 w-full object-cover" 
                alt="Kaffe og prat" 
              />
            </div>
            {/* Dekorativ sirkel bak */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* --- LIVE AKTIVITETS-FEED --- */}
      <section id="aktiviteter" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Hva skjer i nærheten?</h2>
              <p className="text-slate-500 text-lg">Nye aktiviteter legges ut hver dag.</p>
            </div>
            <Link href="/login" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              Vis alle <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aktiviteter.map((aktivitet) => {
                const style = getCategoryStyle(aktivitet.tittel)
                
                return (
                  <Link href={`/aktivitet/${aktivitet.id}`} key={aktivitet.id} className="group">
                    <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
                      
                      {/* Header med ikon */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.color}`}>
                          {style.icon}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                          Aktivitet
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {aktivitet.tittel}
                      </h3>
                      
                      <p className="text-slate-500 mb-6 text-sm line-clamp-2 leading-relaxed">
                        {aktivitet.beskrivelse}
                      </p>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Calendar size={16} className="text-blue-500" />
                          <span className="font-medium">{aktivitet.dato}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="truncate">{aktivitet.sted}</span>
                        </div>
                      </div>

                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Har du en idé til en aktivitet?</h3>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                Det kan være så enkelt som en kaffekopp på hjørnet. Du trenger ikke planlegge noe stort for å glede andre.
              </p>
              <Link href="/login" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                Lag en aktivitet nå
              </Link>
            </div>
            {/* Dekorativt mønster */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 py-12 text-center border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">NyeVenner</h2>
        <div className="flex justify-center gap-6 text-slate-500 text-sm font-medium mb-8">
          <a href="#" className="hover:text-slate-900">Om oss</a>
          <a href="#" className="hover:text-slate-900">Hjelp</a>
          <a href="#" className="hover:text-slate-900">Personvern</a>
        </div>
        <p className="text-slate-400 text-sm">© 2025 Amatech AS</p>
      </footer>
    </div>
  )
}