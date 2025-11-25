'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, Type, FileText, Users, Loader2, ArrowLeft, Calendar } from 'lucide-react';

export default function RedigerAktivitetPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();
  
  const [tittel, setTittel] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [stedInput, setStedInput] = useState('');
  const [ingenBegrensning, setIngenBegrensning] = useState(false);
  const [antallPlasser, setAntallPlasser] = useState('4');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data } = await supabase.from('activities').select('*').eq('id', id).single();
      if (data) {
        if (data.creator_id !== user.id) {
          alert('Du kan bare redigere dine egne aktiviteter');
          return router.push('/');
        }
        setTittel(data.tittel);
        setBeskrivelse(data.beskrivelse);
        setStedInput(data.sted);
        setIngenBegrensning(data.max_deltakere === null);
        setAntallPlasser(data.max_deltakere ? String(data.max_deltakere) : '4');
      }
      setLoading(false);
    };
    load();
  }, []);

  const lagreEndringer = async () => {
    setLoading(true);
    
    const { error } = await supabase.from('activities').update({
      tittel,
      beskrivelse,
      sted: stedInput,
      max_deltakere: ingenBegrensning ? null : parseInt(antallPlasser)
    }).eq('id', id);

    if (!error) {
      router.push(`/aktivitet/${id}`); // Går tilbake til detaljsiden
      router.refresh();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Loader2 className="animate-spin"/></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontWeight: 'bold', color: '#64748b', marginBottom: '24px', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Avbryt
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '32px' }}>Rediger</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Tittel</label>
            <input value={tittel} onChange={e => setTittel(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Sted (Adresse)</label>
            <input value={stedInput} onChange={e => setStedInput(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
          </div>

          <div style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 'bold', color: '#334155' }}>Antall plasser:</span>
              <input type="number" value={antallPlasser} onChange={e => setAntallPlasser(e.target.value)} disabled={ingenBegrensning} style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={ingenBegrensning} onChange={e => setIngenBegrensning(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
              <label style={{ fontSize: '14px', color: '#475569' }}>Ubegrenset</label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Beskrivelse</label>
            <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={4} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
          </div>

          <button onClick={lagreEndringer} style={{ width: '100%', padding: '16px', backgroundColor: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', border: 'none', cursor: 'pointer' }}>
            Lagre endringer
          </button>
        </div>
      </div>
    </div>
  );
}
