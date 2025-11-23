'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Chat from '@/components/Chat'
import LoginModal from '@/components/LoginModal' // <-- Ny import
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Loader2 } from 'lucide-react'

// Laster kartet dynamisk
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
  max_deltakere: number | null
}

export default function AktivitetDetalj() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()

  const [aktivitet, setAktivitet] = useState<AktivitetType | null>(null)
  const [erPaameldt, setErPaameldt] = useState(false)
  const [antallPaameldte, setAntallPaameldte] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false) // <-- Styrer boksen

  useEffect(() => {
    lastData()
  }, [])

  const lastData = async () => {
    // 1. Hent aktivitet (Uavhengig av innlogging)
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

    // 2. Hent antall påmeldte (Offentlig info)
    const { count } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', id)
    
    if (count !== null) setAntallPaameldte(count)

    // 3. Sjekk status KUN hvis bruker er logget inn
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
    // Sjekk om bruker er logget inn
    const { data: { user } } = await supabase.auth.getUser()
    
    // HVIS IKKE LOGGET INN: Vis dialogboks!
    if (!user) {
      setShowLoginModal(true)
      return
    }

    // Hvis logget inn: Kjør vanlig logikk
    if (erPaameldt) {
      const { error } = await supabase.from('participants').delete().eq('activity_id', id).eq('user_id', user.id)
      if (!error) {
        setErPaameldt(false)
        setAntallPaameldte(prev => prev - 1)
      }
    } else {
      const { error } = await supabase.from('participants').insert({ activity_id: id, user_id: user.id })
      if (!error) {
        setErPaameldt(true)
        setAntallPaameldte(prev => prev + 1)
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  )
  
  if (!aktivitet) return <div className="p-10 text-center">Fant ikke aktiviteten.</div>

  const erFullt = aktivitet.max_deltakere ? antallPaameldte >= aktivitet.max_deltakere : false

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans">
      
      {/* Vis login-boksen hvis staten er true */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => router.back()} 
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">Tilbake</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
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
                disabled={erFullt && !erPaameldt}
                className={`w-full py-5 rounded-2xl text-xl font-bold shadow-lg transform transition-all hover:scale-[1.02] flex items-center justify-center gap-3
                  ${erPaameldt 
                    ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50' 
                    : erFullt 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  }`}
              >
                {erPaameldt ? (
                  <>
                    <XCircle size={24} /> Melde meg av
                  </>
                ) : erFullt ? (
                  <>Fulltegnet</>
                ) : (
                  <>
                    <CheckCircle size={24} /> Jeg blir med!
                  </>
                )}
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-500" /> Kart
              </h3>
              <Map adresse={aktivitet.sted} />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-3xl border-2 ${erPaameldt ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Users size={20} className="text-blue-500" /> Påmeldte
              </h3>
              
              <div className="text-4xl font-black text-gray-900 mb-1">
                {antallPaameldte} 
                <span className="text-lg text-gray-400 font-medium ml-2">
                   / {aktivitet.max_deltakere ? aktivitet.max_deltakere : '∞'}
                </span>
              </div>
              <p className="text-gray-500 text-sm">personer skal på dette.</p>

              {erPaameldt && (
                <div className="mt-4 pt-4 border-t border-green-200 text-green-700 font-bold flex items-center gap-2">
                  <CheckCircle size={16} /> Du har plass!
                </div>
              )}
            </div>

            {erPaameldt && (
              <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Chat activityId={id as string} />
              </div>
            )}
            
            {/* Info hvis ikke påmeldt (skjuler chat) */}
            {!erPaameldt && (
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-800 text-sm">
                <p>Når du melder deg på, får du tilgang til chatten for å snakke med de andre deltakerne.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}