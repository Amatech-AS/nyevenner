'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Chat from '@/components/Chat'
import LoginModal from '@/components/LoginModal'
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Loader2 } from 'lucide-react'

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div> 
})

type AktivitetType = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string; max_deltakere: number | null; image_url: string | null }

export default function AktivitetDetalj() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()
  const [aktivitet, setAktivitet] = useState<AktivitetType | null>(null)
  const [erPaameldt, setErPaameldt] = useState(false)
  const [antallPaameldte, setAntallPaameldte] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => { lastData() }, [])

  const lastData = async () => {
    const { data: akt } = await supabase.from('activities').select('*').eq('id', id).single()
    if (akt) setAktiviteter(akt)

    const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('activity_id', id)
    if (count !== null) setAntallPaameldte(count)

    const { data: { user } } = await supabase.auth.getUser()
    if (user && id) {
      const { data: sjekk } = await supabase.from('participants').select('*').eq('activity_id', id).eq('user_id', user.id).single()
      if (sjekk) setErPaameldt(true)
    }
    setLoading(false)
  }

  // Liten fiks for setAktivitet typo over
  const setAktiviteter = (data: any) => setAktivitet(data)

  const togglePaamelding = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setShowLoginModal(true); return }
    if (erPaameldt) {
      const { error } = await supabase.from('participants').delete().eq('activity_id', id).eq('user_id', user.id)
      if (!error) { setErPaameldt(false); setAntallPaameldte(p => p - 1) }
    } else {
      const { error } = await supabase.from('participants').insert({ activity_id: id, user_id: user.id })
      if (!error) { setErPaameldt(true); setAntallPaameldte(p => p + 1) }
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="animate-spin text-slate-400" size={40} /></div>
  if (!aktivitet) return <div className="p-10 text-center">Fant ikke aktiviteten.</div>
  
  const erFullt = aktivitet.max_deltakere ? antallPaameldte >= aktivitet.max_deltakere : false

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      {/* BILDE HERO */}
      <div className="relative h-[40vh] w-full">
        <img 
          src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80'} 
          className="w-full h-full object-cover" 
          alt={aktivitet.tittel}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-transparent"></div>
        <button onClick={() => router.back()} className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-sm shadow-md hover:scale-105 transition-transform">
          ← Tilbake
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50">
          
          <div className="flex flex-col md:flex-row gap-8 justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">{aktivitet.tittel}</h1>
              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                  <Calendar size={16} /> {aktivitet.dato}
                </span>
                <span className="bg-rose-50 text-rose-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                  <MapPin size={16} /> {aktivitet.sted}
                </span>
              </div>
            </div>
            
            {/* Påmeldingsboks */}
            <div className="bg-slate-50 p-6 rounded-3xl min-w-[200px] text-center border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Deltakere</p>
              <p className="text-3xl font-black text-slate-900">
                {antallPaameldte} <span className="text-lg text-slate-400 font-medium">/ {aktivitet.max_deltakere || '∞'}</span>
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Om aktiviteten</h3>
                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">{aktivitet.beskrivelse}</p>
              </div>

              <div className="rounded-3xl overflow-hidden border border-slate-100 h-64">
                 <Map adresse={aktivitet.sted} />
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={togglePaamelding}
                disabled={erFullt && !erPaameldt}
                className={`w-full py-5 rounded-2xl text-xl font-bold shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3
                  ${erPaameldt ? 'bg-white border-2 border-red-100 text-red-500' : 
                    erFullt ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}
              >
                {erPaameldt ? 'Meld av' : erFullt ? 'Fullt' : 'Jeg blir med!'}
              </button>
              
              {erPaameldt && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <Chat activityId={id as string} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}