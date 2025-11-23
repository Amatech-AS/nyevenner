'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function NyAktivitetPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [dato, setDato] = useState('')
  const [sted, setSted] = useState('')
  const [loading, setLoading] = useState(false)

  const lagreAktivitet = async () => {
    if (!tittel || !dato) {
      alert('Du må i det minste fylle ut tittel og tidspunkt.')
      return
    }
    setLoading(true)

    // Hent brukeren sin ID
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Lagre i databasen
      const { error } = await supabase
        .from('activities')
        .insert({
          tittel,
          beskrivelse,
          dato,
          sted,
          creator_id: user.id
          // Vi kan legge til postnummer automatisk senere
        })

      if (!error) {
        router.push('/minside')
        router.refresh()
      } else {
        alert('Noe gikk galt: ' + error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl h-fit border border-gray-200">
        
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Lag en ny aktivitet</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xl font-medium mb-2">Hva skal skje?</label>
            <input 
              value={tittel}
              onChange={(e) => setTittel(e.target.value)}
              placeholder="F.eks. Strikkekveld"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl"
            />
          </div>

          <div>
            <label className="block text-xl font-medium mb-2">Litt mer info</label>
            <textarea 
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              placeholder="F.eks. Ta med eget garn, jeg stiller med kaffe."
              rows={3}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xl font-medium mb-2">Når?</label>
              <input 
                value={dato}
                onChange={(e) => setDato(e.target.value)}
                placeholder="F.eks. Mandag kl 18"
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl"
              />
            </div>
            <div>
              <label className="block text-xl font-medium mb-2">Hvor?</label>
              <input 
                value={sted}
                onChange={(e) => setSted(e.target.value)}
                placeholder="F.eks. Hjemme hos meg"
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => router.back()}
              className="px-6 py-4 text-xl font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              Avbryt
            </button>
            <button 
              onClick={lagreAktivitet}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 rounded-xl shadow-md"
            >
              {loading ? 'Lagrer...' : 'Publiser aktivitet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}