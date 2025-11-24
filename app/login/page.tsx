'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else {
      router.push('/minside')
      router.refresh()
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Sjekk e-posten din!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 md:p-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Velkommen 👋</h1>
          <p className="text-slate-500 mt-2">Logg inn for å bli med</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="din@epost.no"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="******"
            />
          </div>

          {message && <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm text-center">{message}</div>}

          <div className="pt-4 flex flex-col gap-3">
            <button onClick={handleLogin} disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="animate-spin" /> : 'Logg inn'}
            </button>
            <button onClick={handleSignUp} disabled={loading} className="btn-secondary w-full">
              Ny bruker? Registrer deg
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
