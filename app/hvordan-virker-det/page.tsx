'use client'

import Link from 'next/link'
import { ArrowLeft, UserPlus, Search, CheckCircle, Heart } from 'lucide-react'

export default function HvordanVirkerDet() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b', fontWeight: 'bold' }}>
            <ArrowLeft size={20} /> Tilbake til forsiden
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>
          Slik bruker du NyeVenner
        </h1>
        <p style={{ fontSize: '18px', color: '#475569', textAlign: 'center', marginBottom: '48px', lineHeight: '1.6' }}>
          NyeVenner er et sted hvor du kan finne hyggelige ting å gjøre sammen med andre. <br/>Det er helt gratis, og du bestemmer selv hva du vil være med på.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Steg 1 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '50%', color: '#2563eb' }}><UserPlus size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>1. Lag en bruker (Det tar 1 minutt)</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              Trykk på "Logg inn" øverst på siden og velg "Ny bruker".
            </p>
          </div>

          {/* Steg 2 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#fdf2f8', padding: '12px', borderRadius: '50%', color: '#db2777' }}><Search size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>2. Finn noe du har lyst til</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              På forsiden ser du mange fliser. Hver flis er en aktivitet. Trykk på den for å lese mer.
            </p>
          </div>

          {/* Steg 3 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '50%', color: '#059669' }}><CheckCircle size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>3. Bli med!</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              Når du finner noe du liker, trykker du på knappen "Jeg blir med!". 
            </p>
          </div>

          {/* Pårørende - NY TEKST */}
          <div style={{ backgroundColor: '#fffbeb', padding: '32px', borderRadius: '24px', border: '1px solid #fcd34d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '50%', color: '#ea580c' }}><Heart size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#78350f' }}>Laget for å fungere i samråd med pårørende</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#92400e', lineHeight: '1.6' }}>
              Du kan velge å koble en pårørende til din profil slik at de kan hjelpe deg å holde oversikt. 
              Dette er helt valgfritt, og du kan når som helst slette koblingen igjen inne på "Min Side".
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
