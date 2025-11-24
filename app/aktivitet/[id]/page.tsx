'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Chat from '@/components/Chat'
import LoginModal from '@/components/LoginModal'
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Loader2 } from 'lucide-react'

const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div className="h-48 bg-slate-100 rounded-xl animate-pulse"></div> })

type AktivitetType = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string; max_deltakere: number | null; image_url: string | null }

export default function AktivitetDetalj() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()
  const [aktivitet, setAktivitet] = useState<AktivitetType | null>(null)
  const [erPaameldt, setErPaameldt] = useState(false)
  const [antall, setAntall] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('activities').select('*').eq('id', id).single()
      if (data) setAktivitet(data)
      const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('activity_id', id)
      if (count !== null) setAntall(count)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: sjekk } = await supabase.from('participants').select('*').eq('activity_id', id).eq('user_id', user.id).single()
        if (sjekk) setErPaameldt(true)
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setShowModal(true)
    if (erPaameldt) {
      await supabase.from('participants').delete().eq('activity_id', id).eq('user_id', user.id)
      setErPaameldt(false); setAntall(a => a - 1)
    } else {
      await supabase.from('participants').insert({ activity_id: id, user_id: user.id })
      setErPaameldt(true); setAntall(a => a + 1)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!aktivitet) return <div>Fant ikke</div>

  return (
    <div className="min-h-screen pb-20 bg-slate-100">
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      
      {/* BANNER-BILDE */}
      <div className="h-64 w-full relative bg-slate-900">
        <img src={aktivitet.image_url || ''} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-4 max-w-4xl mx-auto">
           <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{aktivitet.tittel}</h1>
           <p className="text-white/90 flex items-center gap-2"><MapPin size={16}/> {aktivitet.sted}</p>
        </div>
        <button onClick={() => router.back()} className="absolute top-4 left-4 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
          <ArrowLeft size={16} /> Tilbake
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto grid md:grid-cols-3 gap-6 p-4 -mt-8 relative z-10">
        
        {/* VENSTRE: INFO */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6 text-blue-700 font-bold bg-blue-50 w-fit px-4 py-2 rounded-lg">
               <Calendar size={20}/> {aktivitet.dato}
            </div>
            <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{aktivitet.beskrivelse}</p>
          </div>
          
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-700"><MapPin className="text-blue-600"/> Kart</h3>
            <div className="rounded-xl overflow-hidden border border-slate-200"><Map adresse={aktivitet.sted} /></div>
          </div>
        </div>

        {/* HØYRE: STATUS & CHAT */}
        <div className="space-y-6">
          <div className="card p-6 text-center">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Påmeldte</p>
            <p className="text-4xl font-black text-slate-900 mb-6">{antall} <span className="text-lg text-slate-400">/ {aktivitet.max_deltakere || '∞'}</span></p>
            <button onClick={toggle} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02] flex justify-center items-center gap-2 ${erPaameldt ? 'bg-white border-2 border-rose-100 text-rose-600' : 'bg-blue-600 text-white'}`}>
              {erPaameldt ? <><XCircle/> Meld av</> : <><CheckCircle/> Bli med</>}
            </button>
          </div>

          {erPaameldt ? (
            <div className="card overflow-hidden"><Chat activityId={id as string} /></div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800 text-sm text-center font-medium">
              Meld deg på for å se chatten og snakke med de andre.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}