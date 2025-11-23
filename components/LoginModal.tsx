'use client'

import Link from 'next/link'
import { X, UserPlus, LogIn } from 'lucide-react'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 relative">
        
        {/* Lukkeknapp */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus size={32} />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 mb-3">Vil du bli med?</h3>
          <p className="text-gray-600 mb-8 text-lg">
            For å melde deg på aktiviteter og snakke med de andre, må du ha en profil. Det er helt gratis!
          </p>

          <div className="space-y-3">
            <Link 
              href="/login" 
              className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-200"
            >
              Opprett bruker / Logg inn
            </Link>
            
            <button 
              onClick={onClose}
              className="block w-full bg-white text-gray-500 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Jeg vil bare kikke litt til
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}