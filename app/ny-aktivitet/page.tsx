'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import * as chrono from 'chrono-node';
import { MapPin, Calendar, Type, FileText, Users, Loader2, ArrowLeft } from 'lucide-react';

export default function NyAktivitetPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [tittel, setTittel] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [datoInput, setDatoInput] = useState('');
  const [tolketDato, setTolketDato] = useState('');
  const [stedInput, setStedInput] = useState('');
  const [ingenBegrensning, setIngenBegrensning] = useState(false);
  const [antallPlasser, setAntallPlasser] = useState('4');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const sjekk = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      else setCheckingAuth(false);
    };
    sjekk();
  }, []);

  useEffect(() => {
    const results = chrono.parse(datoInput, new Date(), { forwardDate: true });
    if (results.length > 0) {
      setTolketDato(results[0].start.date().toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }));
    }
  }, [datoInput]);

  const lagreAktivitet = async () => {
    if (!tittel || !tolketDato || !stedInput) return alert('Mangler info');
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('activities').insert({
        tittel, beskrivelse, dato: tolketDato, sted: stedInput, 
        max_deltakere: ingenBegrensning ? null : parseInt(antallPlasser), 
        creator_id: user.id
      });
      if (!error) { router.push('/'); router.refresh(); }
      else alert(error.message);
    }
    setLoading(false);
  };

  if (checkingAuth) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin"/></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 20px', display: 'flex', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontWeight: 'bold', color: '#64748b', marginBottom: '24px', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Avbryt
        </button>
        
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '32px' }}>Ny Aktivitet</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Hva skal skje?</label>
            <input value={tittel} onChange={e => setTittel(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Navn på aktivitet" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Når?</label>
              <input value={datoInput} onChange={e => setDatoInput(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="F.eks. Lørdag kl 12" />
              {tolketDato && <p style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>✅ {tolketDato}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Hvor?</label>
              <input value={stedInput} onChange={e => setStedInput(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Møtested" />
            </div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 'bold', color: '#334155' }}>Antall plasser:</span>
              <input 
                type="number" 
                value={antallPlasser} 
                onChange={e => setAntallPlasser(e.target.value)} 
                disabled={ingenBegrensning}
                style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }} 
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={ingenBegrensning} onChange={e => setIngenBegrensning(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
              <label style={{ fontSize: '14px', color: '#475569' }}>Ubegrenset antall (Åpent for alle)</label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Info</label>
            <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={3} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Beskrivelse..." />
          </div>

          <button onClick={lagreAktivitet} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Lagrer...' : 'Publiser Aktivitet'}
          </button>
        </div>
      </div>
    </div>
  )
}