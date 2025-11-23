'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Aktivitet = {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  sted: string
}

export default function MinSide() {
  const supabase = createClient()
  const router = useRouter()
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [loading, setLoading] = useState(true)
  const [navn, setNavn] = useState('')

  useEffect(() => {
    async function hentData() {
      // 1. Hent navnet til brukeren
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profil } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profil) setNavn(profil.full_name)
      }

      // 2. Hent aktiviteter (nyeste først)
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setAktiviteter(data)
      }
      setLoading(false)
    }

    hentData()
  }, [])

  const loggUt = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Toppmeny */}
      <header className="bg-blue-900 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">NyeVenner</h1>
            <p className="text-blue-200 text-lg">Hei, {navn || 'venn'}!</p>
          </div>
          <button 
            onClick={loggUt}
            className="text-white underline text-lg hover:text-blue-200"
          >
            Logg ut
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-6">
        
        {/* Knapp for ny aktivitet */}
        <div className="mb-10 text-center">
          <Link 
            href="/ny-aktivitet"
            className="inline-block bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-6 px-10 rounded-2xl shadow-lg transition-transform hover:scale-105"
          >
            + Lag en ny aktivitet
          </Link>
          <p className="text-gray-500 mt-3 text-lg">Vil du invitere til noe?</p>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
          Aktiviteter i nærheten
        </h2>

        {/* Listen med aktiviteter */}
        {loading ? (
          <p className="text-xl text-center p-10">Laster inn aktiviteter...</p>
        ) : aktiviteter.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center shadow-sm">
            <p className="text-2xl text-gray-600">Ingen aktiviteter her enda.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {aktiviteter.map((aktivitet) => (
              <div key={aktivitet.id} className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">{aktivitet.tittel}</h3>
                    <p className="text-xl text-gray-700 mb-4 leading-relaxed line-clamp-2">{aktivitet.beskrivelse}</p>
                    
                    <div className="flex flex-col gap-2 text-lg text-gray-600 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>📅</span> 
                        <span className="font-semibold text-black">{aktivitet.dato}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span> 
                        <span>{aktivitet.sted}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Her er endringen: Link i stedet for button */}
                  <Link 
                    href={`/aktivitet/${aktivitet.id}`} 
                    className="bg-blue-100 text-blue-800 px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-200 whitespace-nowrap"
                  >
                    Se mer →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}