'use client'

import Link from 'next/link'
import { ArrowLeft, UserPlus, Search, Calendar, Heart, CheckCircle, Share, MoreVertical, PlusSquare } from 'lucide-react'

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
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>1. Lag en bruker</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              For å melde deg på aktiviteter, må vi vite hvem du er. Trykk på "Logg inn" øverst på siden og velg "Ny bruker". Du trenger bare en e-postadresse.
            </p>
          </div>

          {/* Steg 2 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#fdf2f8', padding: '12px', borderRadius: '50%', color: '#db2777' }}><Search size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>2. Finn noe du har lyst til</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              På forsiden ser du mange firkanter (fliser). Hver flis er en aktivitet, for eksempel en gåtur eller kaffeprat. Trykk på flisen for å lese mer om hvor og når det skjer.
            </p>
          </div>

          {/* Steg 3 */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '50%', color: '#059669' }}><CheckCircle size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>3. Bli med!</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
              Når du finner noe du liker, trykker du på knappen "Jeg blir med!". Da vet arrangøren at du kommer. Du kan også se hvem andre som skal.
            </p>
          </div>

          {/* Steg 4 (Pårørende) */}
          <div style={{ backgroundColor: '#fffbeb', padding: '32px', borderRadius: '24px', border: '1px solid #fcd34d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '50%', color: '#ea580c' }}><Heart size={24} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#78350f' }}>For pårørende</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#92400e', lineHeight: '1.6' }}>
              Har du en sønn, datter eller venn som vil hjelpe deg? De kan koble seg til din profil. Da kan de se kalenderen din og hjelpe deg å huske avtaler. Du finner koden din inne på "Min Side".
            </p>
          </div>
        </div>

        {/* --- SEKSJON: APP INSTALLASJON --- */}
        <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: '32px' }}>
                Få NyeVenner som app på mobilen
            </h2>

            {/* 
                HER ER FIKSEN: 
                I stedet for 'md:', bruker vi 'gridTemplateColumns: repeat(auto-fit, minmax(300px, 1fr))'
                Dette betyr: "Lag så mange kolonner på minst 300px som det er plass til".
                På mobil blir det 1 kolonne, på PC blir det 2. Helt automatisk.
            */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                
                {/* IPHONE */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>På iPhone / iPad</h3>
                    <ol style={{ paddingLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
                        <li>1. Trykk på <strong>Del-knappen</strong> <Share size={16} style={{display:'inline'}}/> nederst på skjermen.</li>
                        <li>2. Bla nedover i listen.</li>
                        <li>3. Trykk på <strong>"Legg til på Hjem-skjerm"</strong> <PlusSquare size={16} style={{display:'inline'}}/>.</li>
                        <li>4. Trykk "Legg til" øverst i hjørnet.</li>
                    </ol>
                </div>

                {/* ANDROID */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>På Android (Samsung, m.fl.)</h3>
                    <ol style={{ paddingLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
                        <li>1. Trykk på menyen (tre prikker) <MoreVertical size={16} style={{display:'inline'}}/> øverst til høyre.</li>
                        <li>2. Velg <strong>"Legg til på startsiden"</strong> eller "Installer app".</li>
                        <li>3. Bekreft ved å trykke "Legg til".</li>
                    </ol>
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