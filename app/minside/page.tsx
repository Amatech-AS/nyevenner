'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Calendar, ArrowRight, History } from 'lucide-react'

export default function MinSide() {
  const supabase = createClient()
  const router = useRouter()
  const [profil, setProfil] = useState<any>(null)
  const [kommende, setKommende] = useState<any[]>([])
  const [tidligere, setTidligere] = useState<any[]>([])
  const [visHistorikk, setVisHistorikk] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfil(prof)

      const { data: paameldinger } = await supabase.from('participants').select('activity_id').eq('user_id', user.id)
      if (paameldinger && paameldinger.length > 0) {
        const ids = paameldinger.map(p => p.activity_id)
        const { data: akts } = await supabase.from('activities').select('*').in('id', ids).order('created_at', { ascending: false })
        if (akts) setKommende(akts) // Enkel demo: Alt er kommende
      }
    }
    load()
  }, [])

  const loggUt = async () => { await supabase.auth.signOut(); router.push('/') }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontWeight: '900', fontSize: '20px', color: '#0f172a' }}>Min Side</h1>
        <button onClick={loggUt} style={{ border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', display: 'flex', gap: '8px' }}><LogOut size={16}/> Logg ut</button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', padding: '32px', borderRadius: '24px', marginBottom: '40px', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Hei, {profil?.full_name || 'Venn'}! 👋</h2>
          <p style={{ opacity: '0.9', marginBottom: '24px' }}>Her er din oversikt.</p>
          {profil?.rolle === 'senior' && (
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', opacity: '0.7', marginBottom: '4px' }}>Din kode for pårørende</p>
              <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px' }}>{profil?.invite_code || '...'}</p>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20}/> Det som kommer</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {kommende.length === 0 && <p style={{ color: '#64748b' }}>Du har ikke meldt deg på noe enda.</p>}
            {kommende.map(a => (
              <Link href={`/aktivitet/${a.id}`} key={a.id} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div>
                    <h4 style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{a.tittel}</h4>
                    <p style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px' }}><span>{a.dato}</span> <span>📍 {a.sted}</span></p>
                  </div>
                  <ArrowRight size={18} color="#cbd5e1"/>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <button onClick={() => setVisHistorikk(!visHistorikk)} style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}>
          <History size={18}/> {visHistorikk ? 'Skjul historikk' : 'Se tidligere aktiviteter'}
        </button>

        {visHistorikk && (
          <div style={{ marginTop: '20px', opacity: '0.6', display: 'grid', gap: '16px' }}>
            {tidligere.map(a => (
              <div key={a.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontWeight: 'bold', color: '#475569', textDecoration: 'line-through' }}>{a.tittel}</h4>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}