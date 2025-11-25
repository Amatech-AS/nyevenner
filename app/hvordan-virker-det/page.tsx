'use client'

import Link from 'next/link'
import { ArrowLeft, UserPlus, Search, CheckCircle, Heart, Coffee, Sun, Users } from 'lucide-react'

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
        
        {/* SALGSPITCH - HOVEDDEL */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>
              Hvorfor sitte alene når vi kan gjøre noe sammen?
            </h1>
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
              NyeVenner er laget for deg som ønsker litt mer liv i hverdagen. Kanskje savner du noen å drikke kaffe med? 
              Eller noen å gå tur med, men synes dørstokkmila er lang? Her finner du vanlige folk i ditt nabolag som ønsker akkurat det samme som deg.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ecfdf5', color: '#059669', borderRadius: '99px', fontWeight: 'bold' }}><CheckCircle size={16}/> Helt gratis</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#eff6ff', color: '#2563eb', borderRadius: '99px', fontWeight: 'bold' }}><Coffee size={16}/> Lav terskel</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#fff7ed', color: '#ea580c', borderRadius: '99px', fontWeight: 'bold' }}><Sun size={16}/> Trygt</span>
            </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '24px' }}>Slik kommer du i gang</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Steg 1 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '50%', color: '#2563eb' }}><UserPlus size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>1. Lag en bruker (Det tar 1 minutt)</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              Trykk på "Logg inn" øverst på siden. Du trenger bare en e-postadresse. Vi spør ikke om kompliserte ting.
            </p>
          </div>

          {/* Steg 2 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#fdf2f8', padding: '12px', borderRadius: '50%', color: '#db2777' }}><Search size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>2. Finn noe du har lyst til</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              På forsiden ser du mange firkanter (fliser). Hver flis er en aktivitet, for eksempel en gåtur eller strikkekveld. 
              Trykk på flisen for å lese mer om hvor og når det skjer.
            </p>
          </div>

          {/* Steg 3 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '50%', color: '#059669' }}><CheckCircle size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>3. Bli med!</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              Når du finner noe du liker, trykker du på knappen "Jeg blir med!". Da vet arrangøren at du kommer.
              Du kan melde deg av igjen når som helst hvis det ikke passer likevel.
            </p>
          </div>
          
          {/* PÅRØRENDE - TEKNISK FORKLARING */}
          <div style={{ backgroundColor: '#fffbeb', padding: '32px', borderRadius: '24px', border: '2px solid #fcd34d', marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '50%', color: '#ea580c' }}><Heart size={24} /></div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#78350f' }}>Laget for å fungere i samråd med pårørende</h2>
            </div>
            
            <p style={{ fontSize: '16px', color: '#92400e', lineHeight: '1.6', marginBottom: '24px' }}>
              Vi vet at teknologi kan være vanskelig, og at det er godt å ha noen i ryggen. Derfor har vi laget en unik funksjon som lar en datter, sønn eller venn hjelpe til.
            </p>

            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #fde68a' }}>
                <h3 style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '12px' }}>Slik kobler dere sammen (Teknisk):</h3>
                <ol style={{ listStyleType: 'decimal', paddingLeft: '20px', color: '#78350f', lineHeight: '1.8', fontSize: '16px' }}>
                    <li><strong>Senioren</strong> logger inn og går til "Min Side".</li>
                    <li>Der står det en unik kode (f.eks. TUR-123) i en gul boks.</li>
                    <li><strong>Pårørende</strong> lager sin <em>egen</em> bruker på sin egen telefon/PC.</li>
                    <li>Pårørende går til sin "Min Side" og skriver inn koden i feltet "Koble til".</li>
                    <li><strong>Ferdig!</strong> Nå kan den pårørende se hva senioren har planlagt i sin kalender.</li>
                </ol>
                <p style={{ marginTop: '16px', fontSize: '14px', color: '#92400e', fontStyle: 'italic' }}>
                    NB: Senioren bestemmer. Koblingen kan slettes med ett trykk fra "Min Side" når som helst.
                </p>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
           <Link href="/login" style={{ display: 'inline-block', background: '#0f172a', color: 'white', padding: '16px 32px', borderRadius: '99px', fontWeight: 'bold', fontSize: '18px', textDecoration: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)' }}>
             Kom i gang nå
           </Link>
        </div>

      </div>
    </div>
  )
}
