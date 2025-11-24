'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { MapPin, Calendar, Users, Loader2 } from 'lucide-react'

type Aktivitet = { 
  id: string; 
  tittel: string; 
  beskrivelse: string; 
  dato: string; 
  sted: string;
  max_deltakere: number | null;
  image_url: string | null;
}

export default function LandingPage() {
  const supabase = createClient()
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hentData() {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)
      
      if (data) setAktiviteter(data)
      setLoading(false)
    }
    hentData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-slate-900 font-sans">
      
      {/* HEADER - Standard Tailwind UI Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-1 md:flex md:items-center md:gap-12">
              <Link href="/" className="block text-blue-600 text-xl font-black tracking-tight">
                NyeVenner
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="sm:flex sm:gap-4">
                <Link
                  className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700"
                  href="/login"
                >
                  Logg inn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        
        <header className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 sm:text-3xl">
            Aktiviteter
          </h2>
          <p className="mt-2 max-w-md text-gray-500">
            Finn aktiviteter i ditt nærområde.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          /* 
             TEMPLATE: "Product Grid" fra HyperUI / Tailwind UI
             Dette oppsettet garanterer 2 kolonner på små skjermer og 4 på store.
          */
          <ul className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            
            {aktiviteter.map((aktivitet) => (
              <li key={aktivitet.id}>
                <Link href={`/aktivitet/${aktivitet.id}`} className="group block overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  
                  {/* BILDE - Låst til 16:9 format (lavt rektangel) */}
                  <div className="relative h-[120px] sm:h-[150px] w-full overflow-hidden bg-gray-100">
                    <img
                      src={aktivitet.image_url || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400'}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {/* Liten etikett nede i høyre hjørne */}
                    <span className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-900 rounded shadow-sm">
                      {aktivitet.dato ? aktivitet.dato.split(' ')[0] : 'Dato'}
                    </span>
                  </div>

                  {/* INNHOLD - Kompakt tekst */}
                  <div className="relative p-3 sm:p-4 bg-white">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:underline group-hover:underline-offset-4 line-clamp-1">
                      {aktivitet.tittel}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} className="shrink-0" />
                      <p className="truncate">{aktivitet.sted}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{aktivitet.dato ? aktivitet.dato.split(',')[0] : ''}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{aktivitet.max_deltakere || 'Åpent'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Flytende knapp (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link 
          href="/ny-aktivitet" 
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-xl hover:bg-gray-800 hover:scale-105 transition-transform"
        >
          <span className="text-lg font-light leading-none">+</span> Ny
        </Link>
      </div>

    </div>
  )
}