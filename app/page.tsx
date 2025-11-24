'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Search, Users, ArrowRight, Info, Loader2 } from 'lucide-react'

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
  const [mineAktiviteter, setMineAktiviteter] = useState<Aktivitet[]>([])
  const [soketekst, setSoketekst] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function hentData() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // 1. Hent ALLE aktiviteter
      const { data: alle } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (alle) setAktiviteter(alle)

      // 2. Hent MINE påmeldte aktiviteter (hvis logget inn)
      if (user) {
        const { data: paameldinger } = await supabase
          .from('participants')
          .select('activity_id')
          .eq('user_id', user.id)
        
        if (paameldinger && paameldinger.length > 0) {
          const mineIder = paameldinger.map(p => p.activity_id)
          const { data: mine } = await supabase
            .from('activities')
            .select('*')
            .in('id', mineIder)
          
          if (mine) setMineAktiviteter(mine)
        }
      }
      setLoading(false)
    }
    hentData()
  }, [])

  // Filtrering
  const visAktiviteter = soketekst.trim() 
    ? aktiviteter.filter(a => a.tittel.toLowerCase().includes(soketekst.toLowerCase()) || a.sted.toLowerCase().includes(soketekst.toLowerCase()))
    : aktiviteter

  // Komponent for et kort (gjenbrukes)
  const AktivitetKort = ({ aktivitet, erMin = false }: { aktivitet: Aktivitet, erMin?: boolean }) => (
    <Link href={`/aktivitet/${aktivitet.id}`} className="group h-full">
      <div className={`card h-full flex flex-col ${erMin ? 'border-2 border-blue-400 ring-4 ring-blue-50' : ''}`}>
        {/* Bilde - Liten stripe (aspect-video) */}
        <div className="relative w-full h-32 overflow-hidden bg-gray-200">
          <img 
            src={aktivitet.image_url || 'https://images.unsplash.com/photo-1523301343968-63214359d56b?q=80&w=400'} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt=""
          />
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm text-slate-900">
            {aktivitet.dato.split(' ')[0]}
          </div>
          {erMin && <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm">Påmeldt</div>}
        </div>

        {/* Innhold */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {aktivitet.tittel}
          </h3>
          
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
            <MapPin size={12} /> <span className="truncate">{aktivitet.sted}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar size={12} /> <span>{aktivitet.dato.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} /> <span>{aktivitet.max_deltakere || '∞'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen pb-20">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 h-20 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="text-3xl">🏡</span> NyeVenner
          </Link>
          {isLoggedIn ? (
            <Link href="/minside" className="text-sm font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100">Min Side</Link>
          ) : (
            <Link href="/login" className="btn-primary text-sm py-2 px-6 shadow-none">Logg inn</Link>
          )}
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        
        {/* INTRO TEKST FOR ELDRE */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10 flex gap-4 items-start">
          <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm hidden sm:block"><Info size={24} /></div>
          <div>
            <h2 className="text-lg font-bold text-blue-900 mb-1">Velkommen til NyeVenner!</h2>
            <p className="text-blue-800 text-sm leading-relaxed max-w-2xl">
              Dette er en møteplass hvor du kan finne hyggelige aktiviteter i ditt nærområde. 
              <br/>1. Se gjennom listen under. 2. Klikk på en aktivitet du liker. 3. Trykk "Jeg blir med" for å melde deg på. 
              <br/>Er du usikker? Spør gjerne en pårørende om hjelp til å komme i gang.
            </p>
          </div>
        </div>

        {/* SØKEFELT */}
        <div className="mb-10 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={soketekst}
              onChange={(e) => setSoketekst(e.target.value)}
              placeholder="Søk etter tur, kaffe, sted..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
        </div>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32}/></div> : (
          <>
            {/* MINE AKTIVITETER (Vises kun hvis du har noen) */}
            {mineAktiviteter.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">Dine</span>
                  Aktiviteter du skal på
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mineAktiviteter.map(a => <AktivitetKort key={a.id} aktivitet={a} erMin={true} />)}
                </div>
              </div>
            )}

            {/* ALLE AKTIVITETER */}
            <h2 className="text-xl font-bold text-slate-800 mb-4">Finn nye aktiviteter</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visAktiviteter.map(a => <AktivitetKort key={a.id} aktivitet={a} />)}
            </div>
          </>
        )}
      </main>

      <div className="fixed bottom-8 right-8 z-40">
        <Link href="/ny-aktivitet" className="btn-primary rounded-full py-4 px-6 shadow-2xl text-lg flex items-center gap-2">
          + <span className="hidden sm:inline">Lag aktivitet</span>
        </Link>
      </div>
    </div>
  )
}