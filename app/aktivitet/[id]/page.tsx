'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Chat from '@/components/Chat'
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Loader2 } from 'lucide-react'

// Laster kartet dynamisk for å unngå feil på serveren
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400">Laster kart...</div>
})

type AktivitetType = {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  sted: string
}

export default function AktivitetDetalj() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()

  const [aktivitet, setAktivitet] = useState<AktivitetType | null>(null)
  const [erPaameldt, setErPaameldt] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    lastData()
  }, [])

  const lastData = async () => {
    const { data: akt, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      setLoading(false)
      return
    }
    setAktivitet(akt)

    const { data: { user } } = await supabase.auth.getUser()
    if (user && id) {
      const { data: sjekk } = await supabase
        .from('participants')
        .select('*')
        .eq('activity_id', id)
        .eq('user_id', user.id)
        .single()
      
      if (sjekk) setErPaameldt(true)
    }
    setLoading(false)
  }

  const togglePaamelding = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (erPaameldt) {
      // Meld av
      const { error } = await supabase.from('participants').delete().eq('activity_id', id).eq('user_id', user.id)
      if (!error) setErPaameldt(false)
    } else {
      // Meld på
      const { error } = await supabase.from('participants').insert({ activity_id: id, user_id: user.id })
      if (!error) setErPaameldt(true)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  )
  
  if (!aktivitet) return <div className="p-10 text-center">Fant ikke aktiviteten.</div>

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans">
      
      <div className="max-w-4xl mx-auto">
        
        {/* Tilbake-knapp */}
        <button 
          onClick={() => router.back()} 
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">Tilbake</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* VENSTRE KOLONNE: Info og Kart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hovedkort */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/50">
              <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-6 leading-tight">
                {aktivitet.tittel}
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-3 text-blue-700">
                  <Calendar size={20} />
                  <span className="font-bold">{aktivitet.dato}</span>
                </div>
                <div className="bg-purple-50 px-4 py-2 rounded-xl flex items-center gap-3 text-purple-700">
                  <MapPin size={20} />
                  <span className="font-bold">{aktivitet.sted}</span>
                </div>
              </div>

              <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
                {aktivitet.beskrivelse}
              </div>

              {/* Handlingsknapp */}
              <button
                onClick={togglePaamelding}
                className={`w-full py-5 rounded-2xl text-xl font-bold shadow-lg transform transition-all hover:scale-[1.02] flex items-center justify-center gap-3
                  ${erPaameldt 
                    ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  }`}
              >
                {erPaameldt ? (
                  <>
                    <XCircle size={24} /> Melde meg av
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} /> Jeg blir med!
                  </>
                )}
              </button>
            </div>

            {/* Kartseksjon */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-500" /> Kart
              </h3>
              <Map adresse={aktivitet.sted} />
            </div>

          </div>

          {/* HØYRE KOLONNE: Status og Chat */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Statusboks */}
            <div className={`p-6 rounded-3xl border-2 ${erPaameldt ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Users size={20} /> Din status
              </h3>
              <p className={erPaameldt ? 'text-green-800 font-medium' : 'text-gray-500'}>
                {erPaameldt 
                  ? 'Du er påmeldt! 🥳 Husk å sjekke chatten under.' 
                  : 'Du er ikke påmeldt enda.'}
              </p>
            </div>

            {/* Chat (Vises kun hvis påmeldt) */}
            {erPaameldt && (
              <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Chat activityId={id as string} />
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}