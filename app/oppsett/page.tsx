'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function OppsettPage() {
  const supabase = createClient()
  const router = useRouter()

  // Her lagrer vi det brukeren skriver inn midlertidig
  const [navn, setNavn] = useState('')
  const [postnummer, setPostnummer] = useState('')
  const [rolle, setRolle] = useState<'senior' | 'familie' | null>(null)
  const [loading, setLoading] = useState(false)

  const lagreProfil = async () => {
    if (!navn || !postnummer || !rolle) {
      alert('Du må fylle ut alt før du går videre!')
      return
    }

    setLoading(true)

    // 1. Finn ut hvem som er logget inn
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 2. Lagre informasjonen i databasen
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: navn,
          postnummer: postnummer,
          rolle: rolle,
          avatar_url: '' // Vi tar bilde senere
        })

      if (error) {
        alert('Noe gikk galt: ' + error.message)
      } else {
        // 3. Send brukeren videre til hovedsiden
        router.push('/minside') 
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200">
        
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">Velkommen!</h1>
        <p className="text-xl text-gray-600 mb-8 text-center">Vi trenger litt info for å finne aktiviteter til deg.</p>

        <div className="space-y-6">
          
          {/* Spørsmål 1: Navn */}
          <div>
            <label className="block text-xl font-medium text-gray-800 mb-2">Hva heter du?</label>
            <input 
              type="text" 
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="F.eks. Kari Nordmann"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl"
            />
          </div>

          {/* Spørsmål 2: Rolle (Store knapper!) */}
          <div>
            <label className="block text-xl font-medium text-gray-800 mb-4">Hvem er du?</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setRolle('senior')}
                className={`flex-1 p-6 rounded-xl border-4 text-xl font-bold transition-all
                  ${rolle === 'senior' ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
              >
                🧓 Jeg er<br/>Senior
              </button>
              
              <button 
                onClick={() => setRolle('familie')}
                className={`flex-1 p-6 rounded-xl border-4 text-xl font-bold transition-all
                  ${rolle === 'familie' ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
              >
                ❤️ Jeg er<br/>Pårørende
              </button>
            </div>
          </div>

          {/* Spørsmål 3: Postnummer */}
          <div>
            <label className="block text-xl font-medium text-gray-800 mb-2">Hva er postnummeret ditt?</label>
            <input 
              type="text" 
              maxLength={4}
              value={postnummer}
              onChange={(e) => setPostnummer(e.target.value)}
              placeholder="F.eks. 0484"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl w-32"
            />
            <p className="text-gray-500 mt-2 text-lg">Vi bruker dette for å finne venner i nærheten.</p>
          </div>

          {/* Lagre knapp */}
          <button 
            onClick={lagreProfil}
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white text-2xl font-bold py-5 rounded-xl mt-8 transition-colors shadow-lg"
          >
            {loading ? 'Lagrer...' : 'Gå videre til Min Side →'}
          </button>

        </div>
      </div>
    </div>
  )
}