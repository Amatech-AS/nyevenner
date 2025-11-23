'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import * as chrono from 'chrono-node' // Dato-AI
import { MapPin, Calendar, Type, FileText, Loader2 } from 'lucide-react'

export default function NyAktivitetPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  
  // Smart dato input
  const [datoInput, setDatoInput] = useState('')
  const [tolketDato, setTolketDato] = useState<string>('')
  
  // Smart sted input
  const [stedInput, setStedInput] = useState('')
  const [koordinater, setKoordinater] = useState<{lat: string, lon: string} | null>(null)
  
  const [loading, setLoading] = useState(false)

  // AI: Tolk dato mens man skriver
  useEffect(() => {
    const results = chrono.parse(datoInput, new Date(), { forwardDate: true })
    if (results.length > 0) {
      const date = results[0].start.date()
      // Formater pent på norsk
      const penDato = date.toLocaleDateString('no-NO', { 
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
      })
      setTolketDato(penDato)
    } else {
      setTolketDato('')
    }
  }, [datoInput])

  // AI: Finn sted (Geocoding) når man slutter å skrive (debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (stedInput.length > 3) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${stedInput}`)
          const data = await res.json()
          if (data && data.length > 0) {
            setKoordinater({ lat: data[0].lat, lon: data[0].lon })
          }
        } catch (e) { console.error(e) }
      }
    }, 1000) // Vent 1 sek etter skriving
    return () => clearTimeout(timer)
  }, [stedInput])

  const lagreAktivitet = async () => {
    if (!tittel || !tolketDato) {
      alert('Vennligst skriv en tittel og et tidspunkt systemet forstår.')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('activities').insert({
        tittel,
        beskrivelse,
        dato: tolketDato, // Vi lagrer den tolkede datoen
        sted: stedInput,
        creator_id: user.id
        // Merk: Vi kunne lagret koordinater i databasen også hvis vi utvidet tabellen
      })

      if (!error) {
        router.push('/minside')
        router.refresh()
      } else {
        alert(error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-start pt-10">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl border border-gray-100">
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Planlegg noe gøy
        </h1>
        
        <div className="space-y-8">
          
          {/* Tittel */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2 group-focus-within:text-blue-600 transition-colors">
              <Type size={18} /> HVA SKAL SKJE?
            </label>
            <input 
              value={tittel}
              onChange={(e) => setTittel(e.target.value)}
              placeholder="F.eks. Tur til Nidarosdomen"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Smart Dato */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
              <Calendar size={18} /> NÅR? (Skriv naturlig)
            </label>
            <input 
              value={datoInput}
              onChange={(e) => setDatoInput(e.target.value)}
              placeholder="F.eks. Neste mandag kl 18"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
            {tolketDato && (
              <div className="mt-2 text-green-600 font-medium flex items-center gap-2 animate-pulse">
                ✅ Systemet oppfattet: {tolketDato}
              </div>
            )}
          </div>

          {/* Smart Sted */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
              <MapPin size={18} /> HVOR? (Vi finner kartet)
            </label>
            <input 
              value={stedInput}
              onChange={(e) => setStedInput(e.target.value)}
              placeholder="F.eks. Torget i Trondheim"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
            {koordinater && (
              <div className="mt-2 text-sm text-blue-600">
                📍 Fant posisjon: {koordinater.lat}, {koordinater.lon}
              </div>
            )}
          </div>

          {/* Beskrivelse */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
              <FileText size={18} /> MER INFO
            </label>
            <textarea 
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              rows={3}
              placeholder="Detaljer..."
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Knapper */}
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => router.back()}
              className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              Avbryt
            </button>
            <button 
              onClick={lagreAktivitet}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Publiser ✨'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}