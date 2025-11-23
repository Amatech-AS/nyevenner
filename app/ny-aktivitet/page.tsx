'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import * as chrono from 'chrono-node'
import { MapPin, Calendar, Type, FileText, Users, Loader2 } from 'lucide-react'

export default function NyAktivitetPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [datoInput, setDatoInput] = useState('')
  const [tolketDato, setTolketDato] = useState<string>('')
  const [stedInput, setStedInput] = useState('')
  
  // NYTT: Antall deltakere
  const [ingenBegrensning, setIngenBegrensning] = useState(true)
  const [antallPlasser, setAntallPlasser] = useState('5')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const results = chrono.parse(datoInput, new Date(), { forwardDate: true })
    if (results.length > 0) {
      const date = results[0].start.date()
      const penDato = date.toLocaleDateString('no-NO', { 
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
      })
      setTolketDato(penDato)
    } else {
      setTolketDato('')
    }
  }, [datoInput])

  const lagreAktivitet = async () => {
    if (!tittel || !tolketDato || !stedInput) {
      alert('Du må fylle ut tittel, tidspunkt og sted.')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('activities').insert({
        tittel,
        beskrivelse,
        dato: tolketDato,
        sted: stedInput,
        max_deltakere: ingenBegrensning ? null : parseInt(antallPlasser), // Null betyr ubegrenset
        creator_id: user.id
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
    <div className="min-h-screen bg-[#F3F4F6] p-4 flex justify-center items-start pt-10">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-2xl border border-gray-200">
        
        <h1 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-4">
          Planlegg aktivitet
        </h1>
        
        <div className="space-y-8">
          
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-2">
              <Type className="text-blue-600" /> Hva skal dere gjøre?
            </label>
            <input 
              value={tittel}
              onChange={(e) => setTittel(e.target.value)}
              placeholder="F.eks. Tur rundt vannet"
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-2">
              <Calendar className="text-blue-600" /> Når skal det skje?
            </label>
            <input 
              value={datoInput}
              onChange={(e) => setDatoInput(e.target.value)}
              placeholder="F.eks. Lørdag kl 12"
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl focus:border-blue-600 outline-none"
            />
            {tolketDato && <p className="text-green-700 mt-2 font-medium">✅ Oppfattet: {tolketDato}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-2">
              <MapPin className="text-blue-600" /> Hvor møtes dere?
            </label>
            <input 
              value={stedInput}
              onChange={(e) => setStedInput(e.target.value)}
              placeholder="F.eks. Ved inngangen til biblioteket"
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl focus:border-blue-600 outline-none"
            />
          </div>

          {/* NYTT: Antall deltakere */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <label className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <Users className="text-blue-600" /> Hvor mange kan være med?
            </label>
            
            <div className="flex items-center gap-4 mb-4">
              <input 
                type="checkbox" 
                id="unlimited" 
                checked={ingenBegrensning} 
                onChange={(e) => setIngenBegrensning(e.target.checked)}
                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="unlimited" className="text-xl text-slate-800 cursor-pointer">
                Det er plass til alle (Ingen begrensning)
              </label>
            </div>

            {!ingenBegrensning && (
              <div className="flex items-center gap-4 animate-fade-in">
                <span className="text-lg">Maks antall personer:</span>
                <input 
                  type="number" 
                  value={antallPlasser}
                  onChange={(e) => setAntallPlasser(e.target.value)}
                  className="w-24 p-3 border-2 border-blue-200 rounded-lg text-xl font-bold text-center"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-2">
              <FileText className="text-blue-600" /> Ekstra informasjon
            </label>
            <textarea 
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              rows={3}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl focus:border-blue-600 outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => router.back()} className="px-8 py-4 text-slate-500 font-bold hover:bg-gray-100 rounded-xl">Avbryt</button>
            <button 
              onClick={lagreAktivitet}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white text-xl font-bold py-4 rounded-xl hover:bg-blue-700 shadow-md"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Publiser aktivitet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}