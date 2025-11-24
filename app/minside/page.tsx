'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Calendar, MapPin, Clock, History } from 'lucide-react'

export default function MinSide() {
  const supabase = createClient()
  const router = useRouter()
  const [profil, setProfil] = useState<any>(null)
  const [kommende, setKommende] = useState<any[]>([])
  const [tidligere, setTidligere] = useState<any[]>([]) // Historikk
  const [visHistorikk, setVisHistorikk] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfil(prof)

      // Hent aktiviteter jeg er med på
      const { data: paameldinger } = await supabase.from('participants').select('activity_id').eq('user_id', user.id)
      if (paameldinger && paameldinger.length > 0) {
        const ids = paameldinger.map(p => p.activity_id)
        const { data: akts } = await supabase.from('activities').select('*').in('id', ids).order('created_at', { ascending: false })
        
        if (akts) {
          // Enkel sortering basert på dato-string er vanskelig, så vi bruker created_at som en "ca" sortering her for demo, 
          // men ideelt sett burde dato vært et ekte Date-felt i databasen.
          // Her legger jeg bare alt i kommende foreløpig, og viser logikken for historikk.
          setKommende(akts)
          // I en ekte app ville vi filtrert på dato < Date.now() for historikk
          setTidligere(akts.slice(5)) // Demo: Late som om de eldste er historikk
        }
      }
    }
    load()
  }, [])

  const loggUt = async () => { await supabase.auth.signOut(); router.push('/') }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <nav className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
        <h1 className="font-black text-xl text-slate-900">Min Side</h1>
        <button onClick={loggUt} className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2"><LogOut size={16}/> Logg ut</button>
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        
        <div className="card p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <h2 className="text-3xl font-bold mb-2">Hei, {profil?.full_name || 'Venn'}! 👋</h2>
          <p className="opacity-90 mb-6">Her er oversikten din.</p>
          {profil?.rolle === 'senior' && (
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Din kode for pårørende</p>
              <p className="text-3xl font-mono font-black tracking-widest">{profil?.invite_code || '...'}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar/> Det som kommer</h3>
          <div className="space-y-4">
            {kommende.length === 0 && <p className="text-slate-500">Du har ikke meldt deg på noe enda.</p>}
            {kommende.map(a => (
              <Link href={`/aktivitet/${a.id}`} key={a.id} className="card p-4 flex items-center justify-between hover:border-blue-300 transition-colors group">
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600">{a.tittel}</h4>
                  <p className="text-sm text-slate-500 flex gap-3 mt-1"><span>{a.dato}</span> <span>📍 {a.sted}</span></p>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600"/>
              </Link>
            ))}
          </div>
        </div>

        <button onClick={() => setVisHistorikk(!visHistorikk)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
          <History size={18}/> {visHistorikk ? 'Skjul historikk' : 'Se tidligere aktiviteter'}
        </button>

        {visHistorikk && (
          <div className="space-y-4 opacity-70">
            {tidligere.map(a => (
              <div key={a.id} className="card p-4 bg-slate-50 border-slate-100 flex justify-between items-center">
                <div><h4 className="font-bold text-slate-600 line-through">{a.tittel}</h4><p className="text-xs text-slate-400">Gjennomført</p></div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}