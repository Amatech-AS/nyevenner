'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Heart, MapPin, CheckCircle, Loader2 } from 'lucide-react'

export default function OppsettPage() {
  const supabase = createClient()
  const router = useRouter()

  const [navn, setNavn] = useState('')
  const [postnummer, setPostnummer] = useState('')
  const [rolle, setRolle] = useState<'senior' | 'familie' | null>(null)
  const [loading, setLoading] = useState(false)

  const lagreProfil = async () => {
    if (!navn || !postnummer || !rolle) {
      alert('Vennligst fyll ut alle feltene.')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: navn,
        postnummer: postnummer,
        rolle: rolle,
        avatar_url: ''
      })

      if (!error) {
        router.push('/minside')
      } else {
        alert(error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/50">
        
        <div className="text-center mb-10">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <User size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Velkommen!</h1>
          <p className="text-lg text-gray-500 mt-2">La oss bli litt bedre kjent før vi starter.</p>
        </div>

        <div className="space-y-8">
          
          {/* Navn */}
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Hva heter du?</label>
            <input 
              type="text" 
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="F.eks. Kari Nordmann"
              className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Rolle Valg */}
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Jeg ønsker å bruke siden som:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setRolle('senior')}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${
                  rolle === 'senior' 
                    ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                {rolle === 'senior' && <div className="absolute top-4 right-4 text-blue-600"><CheckCircle /></div>}
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Bruker</h3>
                <p className="text-sm text-gray-500 mt-1">Jeg vil finne aktiviteter og venner.</p>
              </button>
              
              <button 
                onClick={() => setRolle('familie')}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${
                  rolle === 'familie' 
                    ? 'border-purple-600 bg-purple-50 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                {rolle === 'familie' && <div className="absolute top-4 right-4 text-purple-600"><CheckCircle /></div>}
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                  <Heart size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Pårørende</h3>
                <p className="text-sm text-gray-500 mt-1">Jeg vil hjelpe en i familien.</p>
              </button>
            </div>
          </div>

          {/* Postnummer */}
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Postnummer</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-5 text-gray-400" size={20} />
              <input 
                type="text" 
                maxLength={4}
                value={postnummer}
                onChange={(e) => setPostnummer(e.target.value)}
                placeholder="0000"
                className="w-full pl-14 p-5 bg-white border border-gray-200 rounded-2xl text-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm max-w-[200px]"
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">Brukes for å vise aktiviteter i nærheten av deg.</p>
          </div>

          {/* Knapp */}
          <button 
            onClick={lagreProfil}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white text-xl font-bold py-5 rounded-2xl mt-4 transition-all hover:scale-[1.01] flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Fullfør oppsettet'}
          </button>

        </div>
      </div>
    </div>
  )
}