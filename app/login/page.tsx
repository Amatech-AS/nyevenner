'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, HelpCircle, User, Heart } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else { router.push('/minside'); router.refresh(); }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage('Konto opprettet! Sjekk e-posten din.');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ width: '100%', maxWidth: '500px' }}>
        
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 'bold', marginBottom: '24px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Tilbake til forsiden
        </Link>

        {/* SVEVENDE BOKS */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Velkommen 👋</h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Logg inn for å bli med på aktiviteter</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px', paddingLeft: '4px' }}>E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', fontWeight: '500' }}
                placeholder="din@epost.no"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px', paddingLeft: '4px' }}>Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', fontWeight: '500' }}
                placeholder="Min. 6 tegn"
              />
            </div>

            {message && <div style={{ padding: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '12px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px' }}>
                {loading ? <Loader2 className="animate-spin"/> : 'Logg inn'}
                </button>
                
                <button onClick={handleSignUp} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'white', color: '#0f172a', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: '2px solid #e2e8f0', cursor: 'pointer' }}>
                Ny bruker? Registrer deg her
                </button>
            </div>
          </div>
        </div>

        {/* HJELPE-TEKST PÅRØRENDE */}
        <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#eff6ff', borderRadius: '20px', border: '1px solid #dbeafe' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <HelpCircle size={20}/> Trenger du hjelp?
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
             <div style={{ background:'white', padding:'8px', borderRadius:'50%', height:'fit-content' }}><User size={16} color="#2563eb"/></div>
             <div>
                <p style={{ fontWeight:'bold', fontSize:'14px', color:'#1e3a8a', marginBottom:'4px' }}>Hvordan logger jeg inn?</p>
                <p style={{ fontSize:'14px', color:'#3b82f6', lineHeight:'1.5' }}>Skriv inn e-posten din. Hvis du ikke har bruker, trykk på den hvite knappen "Ny bruker".</p>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
             <div style={{ background:'white', padding:'8px', borderRadius:'50%', height:'fit-content' }}><Heart size={16} color="#db2777"/></div>
             <div>
                <p style={{ fontWeight:'bold', fontSize:'14px', color:'#1e3a8a', marginBottom:'4px' }}>For pårørende</p>
                <p style={{ fontSize:'14px', color:'#3b82f6', lineHeight:'1.5' }}>
                    Er du pårørende? Lag din egen bruker først. Inne på siden kan du koble deg til senioren ved å bruke en kode de har på sin "Min Side".
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}