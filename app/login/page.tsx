'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, User, Heart, HelpCircle } from 'lucide-react'

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
    else { router.push('/minside'); router.refresh() }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Konto opprettet! Sjekk e-posten din.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      
      {/* LOGIN BOKS */}
      <div className="card w-full max-w-lg p-8 md:p-10 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Velkommen 👋</h1>
          <p className="text-slate-500 mt-2">Logg inn eller lag en ny konto for å starte.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">E-post adresse</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="din@epost.no" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Passord</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" />
          </div>

          {message && <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm text-center font-bold">{message}</div>}

          <div className="pt-4 space-y-3">
            <button onClick={handleLogin} disabled={loading} className="btn-primary w-full justify-center">{loading ? <Loader2 className="animate-spin"/> : 'Logg inn'}</button>
            <button onClick={handleSignUp} disabled={loading} className="w-full py-4 bg-white text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50">Ny bruker? Registrer deg</button>
          </div>
        </div>
      </div>

      {/* INFO BOKS */}
      <div className="max-w-lg w-full bg-blue-50 border border-blue-100 rounded-2xl p-6 text-slate-700 text-sm space-y-4">
        <h3 className="font-bold text-blue-900 flex items-center gap-2"><HelpCircle size={18}/> Slik fungerer det</h3>
        
        <div className="flex gap-3">
          <div className="bg-white p-2 rounded-full h-fit shadow-sm"><User size={16} className="text-blue-600"/></div>
          <div>
            <p className="font-bold text-slate-900">For deg som bruker:</p>
            <p>Du styrer alt selv. Når du har laget en bruker, kan du melde deg på turer og treff. Det er gratis.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-white p-2 rounded-full h-fit shadow-sm"><Heart size={16} className="text-rose-500"/></div>
          <div>
            <p className="font-bold text-slate-900">For pårørende:</p>
            <p>Du kan koble en pårørende til din konto hvis du ønsker hjelp. Dette gjør du inne på "Min Side" ved å dele en kode. Pårørende kan da se hva du skal på, men de kan ikke melde deg av eller på ting uten din tilgang.</p>
          </div>
        </div>
      </div>

    </div>
  )
}