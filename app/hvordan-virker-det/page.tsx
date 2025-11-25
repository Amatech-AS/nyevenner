'use client'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Search, CheckCircle, Heart } from 'lucide-react'

export default function HvordanVirkerDet() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b', fontWeight: 'bold' }}>
            <ArrowLeft size={20} /> Tilbake til forsiden
          </Link>
        </div>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>Slik bruker du NyeVenner</h1>
        {/* ... (Behold steg 1, 2, 3 som før) ... */}
        
        {/* ENDRET PUNKT OM PÅRØRENDE */}
        <div style={{ backgroundColor: '#fffbeb', padding: '32px', borderRadius: '24px', border: '1px solid #fcd34d', marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '50%', color: '#ea580c' }}><Heart size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#78350f' }}>Laget for å fungere i samråd med pårørende</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#92400e', lineHeight: '1.6' }}>
              Du kan velge å koble en pårørende til din profil. De kan hjelpe deg med oversikten, men du bestemmer. Du kan når som helst slette koblingen igjen inne på "Min Side".
            </p>
        </div>
      </div>
    </div>
  )
}
