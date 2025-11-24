'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Chat from '@/components/Chat';
import LoginModal from '@/components/LoginModal';
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Loader2, Info } from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div style={{height:'160px', background:'#f1f5f9'}}></div> });

type AktivitetType = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string; max_deltakere: number | null; image_url: string | null }

export default function AktivitetDetalj() {
  const supabase = createClient();
  const { id } = useParams();
  const router = useRouter();
  const [aktivitet, setAktivitet] = useState<AktivitetType | null>(null);
  const [erPaameldt, setErPaameldt] = useState(false);
  const [antall, setAntall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: akt } = await supabase.from('activities').select('*').eq('id', id).single();
      if (akt) setAktivitet(akt);
      const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('activity_id', id);
      if (count !== null) setAntall(count);
      const { data: { user } } = await supabase.auth.getUser();
      if (user && id) {
        const { data: sjekk } = await supabase.from('participants').select('*').eq('activity_id', id).eq('user_id', user.id).single();
        if (sjekk) setErPaameldt(true);
      }
      setLoading(false);
    };
    load();
  }, []);

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setShowModal(true);
    if (erPaameldt) {
      await supabase.from('participants').delete().eq('activity_id', id).eq('user_id', user.id);
      setErPaameldt(false); setAntall(a => a - 1);
    } else {
      await supabase.from('participants').insert({ activity_id: id, user_id: user.id });
      setErPaameldt(true); setAntall(a => a + 1);
    }
  };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Loader2 className="animate-spin"/></div>;
  if (!aktivitet) return <div>Fant ikke</div>;

  const erFullt = aktivitet.max_deltakere ? antall >= aktivitet.max_deltakere : false;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', marginBottom: '32px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>
          <ArrowLeft size={16} /> Tilbake
        </button>

        {/* FLEX CONTAINER - Bytter automatisk mellom kolonne og rad */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
            
            {/* VENSTRE SIDE (TEKST) */}
            <div style={{ flex: '2', minWidth: '300px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Aktivitet</span>
              
              <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginTop: '16px', marginBottom: '24px', lineHeight: '1.1' }}>{aktivitet.tittel}</h1>
              
              <div style={{ display: 'flex', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9', marginBottom: '24px', color: '#475569', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20} color="#3b82f6"/> {aktivitet.dato}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} color="#ef4444"/> {aktivitet.sted}</div>
              </div>

              <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>{aktivitet.beskrivelse}</p>

              {erPaameldt ? (
                <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '16px' }}>💬 Samtale</h3>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}><Chat activityId={id as string} /></div>
                </div>
              ) : (
                <div style={{ marginTop: '40px', background: '#eff6ff', padding: '20px', borderRadius: '16px', color: '#1e40af', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Info size={20} /> <p style={{ fontSize: '14px' }}>Meld deg på for å se chatten.</p>
                </div>
              )}
            </div>

            {/* HØYRE SIDE (INFO) */}
            <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* BILDE - LÅST RATIO */}
              <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                  <img src={aktivitet.image_url || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              {/* STATUS BOKS */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Ledige plasser</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                  <Users size={24} color="#0f172a" />
                  <span style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>
                    {antall} <span style={{ fontSize: '16px', color: '#94a3b8' }}>/ {aktivitet.max_deltakere || '∞'}</span>
                  </span>
                </div>

                <button
                  onClick={toggle}
                  disabled={erFullt && !erPaameldt}
                  style={{ 
                    width: '100%', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    backgroundColor: erPaameldt ? 'white' : erFullt ? '#e2e8f0' : '#0f172a',
                    color: erPaameldt ? '#ef4444' : erFullt ? '#94a3b8' : 'white',
                    border: erPaameldt ? '2px solid #fecaca' : 'none'
                  }}
                >
                  {erPaameldt ? 'Meld meg av' : erFullt ? 'Fullt' : 'Jeg blir med!'}
                </button>
              </div>

              {/* KART */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '12px', display: 'flex', gap: '8px' }}><MapPin size={16}/> Kart</p>
                <div style={{ height: '150px', borderRadius: '12px', overflow: 'hidden' }}><Map adresse={aktivitet.sted} /></div>
              </div>

            </div>

        </div>
      </div>
    </div>
  )
}