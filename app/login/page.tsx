'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, HelpCircle, User, Heart, Mail } from 'lucide-react';
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

  // Håndterer Google, Facebook, Apple
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`, // Sørg for at denne finnes i Supabase settings
      },
    });
    if (error) setMessage(error.message);
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

          {/* SOSIALE KNAPPER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <button onClick={() => handleSocialLogin('google')} style={{ width: '100%', padding: '12px', backgroundColor: 'white', color: '#374151', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #e5e7eb', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
               <img src="https://authjs.dev/img/providers/google.svg" style={{width:'20px'}} alt=""/> Fortsett med Google
            </button>
            <button onClick={() => handleSocialLogin('facebook')} style={{ width: '100%', padding: '12px', backgroundColor: '#1877F2', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
               <span style={{fontSize:'18px', fontWeight:'900'}}>f</span> Fortsett med Facebook
            </button>
            <button onClick={() => handleSocialLogin('apple')} style={{ width: '100%', padding: '12px', backgroundColor: 'black', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
               <span style={{fontSize:'18px'}}></span> Fortsett med Apple
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
             <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
             <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>ELLER MED E-POST</span>
             <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
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
                {loading ? <Loader2 className="animate-spin"/> : 'Logg inn med e-post'}
                </button>
                
                <button onClick={handleSignUp} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'white', color: '#0f172a', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: '2px solid #e2e8f0', cursor: 'pointer' }}>
                Ny bruker? Registrer deg her
                </button>
            </div>
          </div>
        </div>

        {/* HJELPE-TEKST */}
        <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#eff6ff', borderRadius: '20px', border: '1px solid #dbeafe' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <HelpCircle size={20}/> Trenger du hjelp?
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
             <div style={{ background:'white', padding:'8px', borderRadius:'50%', height:'fit-content' }}><User size={16} color="#2563eb"/></div>
             <div>
                <p style={{ fontWeight:'bold', fontSize:'14px', color:'#1e3a8a', marginBottom:'4px' }}>Innlogging</p>
                <p style={{ fontSize:'14px', color:'#3b82f6', lineHeight:'1.5' }}>Du kan nå bruke din Google, Facebook eller Apple konto hvis du har det. Det er det enkleste!</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}