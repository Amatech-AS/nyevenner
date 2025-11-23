'use client' // Dette betyr at siden kjører i nettleseren (nødvendig for skjemaer)

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client' // Henter nøkkelkortet vårt
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  // Funksjon for å logge inn
  const handleLogin = async () => {
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Feil: ' + error.message)
      setLoading(false)
    } else {
      router.push('/oppsett') // Send brukeren til "oppsett"
      router.refresh()
    }
  }

  // Funksjon for å registrere ny bruker
  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage('Kunne ikke registrere: ' + error.message)
    } else {
      setMessage('Suksess! Sjekk e-posten din for bekreftelse.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Logg inn</h1>

        <div className="space-y-6">
          
          {/* E-post felt */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">E-post adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.no"
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Passord felt */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Beskjed-boks (vises kun hvis det er feil eller suksess) */}
          {message && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-lg">
              {message}
            </div>
          )}

          {/* Knapper */}
          <div className="flex flex-col gap-4 pt-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white text-xl font-bold py-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              {loading ? 'Jobber...' : 'Logg inn'}
            </button>

            <div className="text-center text-gray-500 my-2">- eller -</div>

            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-white border-2 border-blue-600 text-blue-600 text-xl font-bold py-4 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Ny bruker? Registrer deg
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}