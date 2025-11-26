'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { X, Heart, Mail, Loader2 } from 'lucide-react'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // VIKTIG: Denne linjen fikser "redirect_uri_mismatch"
          // Den bygger URLen dynamisk basert på hvor brukeren er (localhost eller nett)
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error(error)
      alert('Noe gikk galt med Google-påloggingen.')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
          <X size={20} className="text-slate-500" />
        </button>

        <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Logg inn</h2>
        <p className="text-slate-500 text-center mb-8">Velg hvordan du vil logge inn for å bli med.</p>

        <div className="space-y-4 mb-8">
          {/* GOOGLE KNAPP */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              // Google SVG Logo
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>{isLoading ? 'Kobler til Google...' : 'Logg inn med Google'}</span>
          </button>

          {/* E-POST KNAPP */}
          <Link href="/login" className="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-center hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
            <Mail size={20} />
            Logg inn med E-post
          </Link>
        </div>

        {/* INFO OM PÅRØRENDE */}
        <div className="bg-blue-50 rounded-xl p-5 text-sm border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Heart size={16} className="text-red-500"/> Informasjon om pårørende
          </h3>
          <p className="text-slate-700 mb-3 leading-relaxed">
            Du kan koble en pårørende (familie/venn) til din konto slik at de kan se hva du skal på. 
            <strong>Dette styrer du helt selv.</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Du finner en kode på "Min Side" som du kan gi til dem.</li>
            <li>Den pårørende kan <strong>se</strong> dine aktiviteter i sin kalender.</li>
            <li>De kan hjelpe deg å huske tidspunkter, men du bestemmer selv hva du melder deg på.</li>
          </ul>
        </div>

      </div>
    </div>
  )
}