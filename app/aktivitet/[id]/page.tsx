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
    <div className="min-h-screen p-4 md:p-8 flex justify-center items-start pt-12">
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6">
        
        {/* VENSTRE: INFO */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-0">
            <div className="h-64 w-full bg-slate-200 relative">
              <img src={aktivitet.image_url || ''} className="w-full h-full object-cover" />
              <button onClick={() => router.back()} className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                <ArrowLeft size={16} /> Tilbake
              </button>
            </div>
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{aktivitet.tittel}</h1>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg font-bold text-sm flex gap-2 items-center"><Calendar size={16}/> {aktivitet.dato}</span>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold text-sm flex gap-2 items-center"><MapPin size={16}/> {aktivitet.sted}</span>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">{aktivitet.beskrivelse}</p>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="text-blue-600"/> Kart</h3>
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
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-800 text-sm text-center font-medium">
              Meld deg på for å chatte.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
