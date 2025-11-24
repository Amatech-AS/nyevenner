'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, User, Heart, HelpCircle, ArrowLeft } from 'lucide-react';
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 'bold', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Tilbake til forsiden
        </Link>

        {/* KORTET */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Velkommen 👋</h1>
            <p style={{ color: '#64748b' }}>Logg inn for å bli med</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
                placeholder="din@epost.no"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
                placeholder="******"
              />
            </div>

            {message && <div style={{ padding: '12px', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>{message}</div>}

            <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '8px' }}>
              {loading ? 'Jobber...' : 'Logg inn'}
            </button>
            
            <button onClick={handleSignUp} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'white', color: '#0f172a', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              Ny bruker? Registrer deg
            </button>
          </div>

        </div>

        {/* INFO BOKS */}
        <div style={{ marginTop: '24px', padding: '24px', backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #dbeafe' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <HelpCircle size={18}/> Slik fungerer det
          </h3>
          <p style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.5' }}>
            Du må ha en konto for å melde deg på aktiviteter. Det er helt gratis. 
            Du kan også koble til en pårørende inne på "Min Side" senere.
          </p>
        </div>

      </div>
    </div>
  )
}