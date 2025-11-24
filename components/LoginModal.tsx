'use client'

import Link from 'next/link'
import { X, User, Heart } from 'lucide-react'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100">
          <X size={20} className="text-slate-500" />
        </button>

        <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Logg inn</h2>
        <p className="text-slate-500 text-center mb-8">For å melde deg på, må du ha en bruker.</p>

        <div className="space-y-3 mb-8">
          <Link href="/login" className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Gå til pålogging / Registrering
          </Link>
          <button onClick={onClose} className="block w-full py-3 text-slate-500 font-bold hover:text-slate-800">
            Avbryt
          </button>
        </div>

        {/* INFO OM PÅRØRENDE (Krav 9) */}
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