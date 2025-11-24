'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import * as chrono from 'chrono-node'
import { MapPin, Calendar, Type, FileText, Users, Loader2, ArrowLeft } from 'lucide-react'

export default function NyAktivitetPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [datoInput, setDatoInput] = useState('')
  const [tolketDato, setTolketDato] = useState('')
  const [stedInput, setStedInput] = useState('')
  const [ingenBegrensning, setIngenBegrensning] = useState(true)
  const [antallPlasser, setAntallPlasser] = useState('5')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const sjekk = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setCheckingAuth(false)
    }
    sjekk()
  }, [])

  useEffect(() => {
    const results = chrono.parse(datoInput, new Date(), { forwardDate: true })
    if (results.length > 0) {
      setTolketDato(results[0].start.date().toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }))
    }
  }, [datoInput])

  const lagre = async () => {
    if (!tittel || !tolketDato || !stedInput) return alert('Mangler info')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('activities').insert({
        tittel, beskrivelse, dato: tolketDato, sted: stedInput, max_deltakere: ingenBegrensning ? null : parseInt(antallPlasser), creator_id: user.id
      })
      if (!error) router.push('/')
    }
    setLoading(false)
  }

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen flex justify-center items-start pt-12 p-4">
      <div className="card w-full max-w-2xl p-8 md:p-12">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 font-bold text-sm">
          <ArrowLeft size={16} /> Avbryt
        </button>

        <h1 className="text-3xl font-black text-slate-900 mb-8">Planlegg noe gøy</h1>
        
        <div className="space-y-6">
          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2"><Type size={18} /> Hva skjer?</label>
            <input value={tittel} onChange={e => setTittel(e.target.value)} className="input-field text-lg" placeholder="F.eks. Tur rundt vannet" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-bold text-slate-700 mb-2 block flex gap-2"><Calendar size={18} /> Når?</label>
              <input value={datoInput} onChange={e => setDatoInput(e.target.value)} className="input-field" placeholder="F.eks. Lørdag kl 12" />
              {tolketDato && <p className="text-emerald-600 text-xs mt-2 font-bold">✅ {tolketDato}</p>}
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-2 block flex gap-2"><MapPin size={18} /> Hvor?</label>
              <input value={stedInput} onChange={e => setStedInput(e.target.value)} className="input-field" placeholder="Møtested" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" checked={ingenBegrensning} onChange={e => setIngenBegrensning(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
              <label className="font-bold text-slate-700">Åpent for alle (Ubegrenset)</label>
            </div>
            {!ingenBegrensning && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-500">Maks antall:</span>
                <input type="number" value={antallPlasser} onChange={e => setAntallPlasser(e.target.value)} className="w-20 p-2 border rounded-lg text-center font-bold" />
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2"><FileText size={18} /> Info</label>
            <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={3} className="input-field" placeholder="Detaljer..." />
          </div>

          <button onClick={lagre} disabled={loading} className="btn-primary w-full text-lg mt-4">
            {loading ? <Loader2 className="animate-spin" /> : 'Publiser aktivitet'}
          </button>
        </div>
      </div>
    </div>
  )
}
