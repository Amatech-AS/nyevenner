'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Chat from '../../../components/Chat' // <-- Her importerer vi chatten

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
      await supabase.from('participants').delete().eq('activity_id', id).eq('user_id', user.id)
      setErPaameldt(false)
    } else {
      await supabase.from('participants').insert({ activity_id: id, user_id: user.id })
      setErPaameldt(true)
    }
  }

  if (loading) return <div className="p-10 text-xl text-center">Laster informasjon...</div>
  if (!aktivitet) return <div className="p-10 text-xl text-center">Fant ikke aktiviteten.</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex justify-center">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 h-fit my-8">
        
        <button onClick={() => router.back()} className="text-gray-500 text-lg mb-6 hover:underline">
          ← Tilbake til oversikten
        </button>

        <h1 className="text-3xl md:text-5xl font-bold text-blue-900 mb-6">{aktivitet.tittel}</h1>
        
        <div className="bg-blue-50 p-6 rounded-xl mb-8 space-y-4 text-lg text-blue-900 border border-blue-100">
          <p><strong>📅 Når:</strong> {aktivitet.dato}</p>
          <p><strong>📍 Hvor:</strong> {aktivitet.sted}</p>
        </div>

        <p className="text-xl text-gray-700 leading-relaxed mb-10 whitespace-pre-wrap">
          {aktivitet.beskrivelse}
        </p>

        <div className="border-t pt-8">
          <button
            onClick={togglePaamelding}
            className={`w-full py-6 rounded-xl text-2xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-3
              ${erPaameldt 
                ? 'bg-white border-4 border-red-500 text-red-600 hover:bg-red-50' 
                : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            {erPaameldt ? '❌ Jeg vil melde meg av' : '✅ Jeg blir med!'}
          </button>

          {/* Viser bare chatten hvis du er påmeldt */}
          {erPaameldt && (
            <div className="mt-8 animate-fade-in">
               <h2 className="text-2xl font-bold text-gray-800 mb-4">Snakk med gruppen</h2>
               
               {/* Her settes chat-komponenten inn */}
               <Chat activityId={id as string} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}