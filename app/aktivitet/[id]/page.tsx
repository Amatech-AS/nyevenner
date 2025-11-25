'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Chat from '@/components/Chat';
import LoginModal from '@/components/LoginModal';
import Weather from '@/components/Weather';
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Loader2, Info, Coins, Edit2, Trash2, Navigation } from 'lucide-react';

// Laster kartet dynamisk
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div style={{height:'200px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>Laster kart...</div> 
});

type AktivitetType = { 
  id: string; 
  tittel: string; 
  beskrivelse: string; 
  dato: string; 
  sted: string; 
  postnummer: string;
  max_deltakere: number | null; 
  image_url: string | null;
  price: number;
  creator_id: string;
}

// --- SMART BILDEVELGER (Full versjon) ---
const imageCollections = {
  jul: [ 'photo-1543589077-47d81606c1bf', 'photo-1512389142860-9c449e58a543', 'photo-1576919228236-a097c32a5cd4', 'photo-1482517967863-00e15c9b4499', 'photo-1513297887119-d46091b24bfa' ],
  tur: [ 'photo-1551632811-561732d1e306', 'photo-1441974231531-c6227db76b6e', 'photo-1478131143081-80f7f84ca84d', 'photo-1501555088652-021faa106b9b', 'photo-1625246333195-78d9c38ad449' ],
  mat: [ 'photo-1511920170033-f8396924c348', 'photo-1559339352-11d035aa65de', 'photo-1528605248644-14dd04022da1', 'photo-1515003197210-e0cd71810b5f', 'photo-1590947132387-155cc02f3212' ],
  hobby: [ 'photo-1606105886470-8b1e10222045', 'photo-1456735190827-d1261f794971', 'photo-1513364776144-60967b0f800f', 'photo-1520032525096-7bd04a94b5a4' ],
  default: [ 'photo-1511632765486-a01980e01a18', 'photo-1543269865-cbf427effbad', 'photo-1529156069898-49953e39b3ac', 'photo-1523301343968-63214359d56b' ]
};

const getSmartImage = (tittel: string, id: string) => {
  const t = tittel ? tittel.toLowerCase() : '';
  let collection = imageCollections.default;
  
  if (t.match(/jul|advent|lucia/)) collection = imageCollections.jul;
  else if (t.match(/tur|gå|marka|skog|fjell|natur/)) collection = imageCollections.tur;
  else if (t.match(/mat|spise|kaffe|vaffel|lunsj|middag|pizza|date/)) collection = imageCollections.mat;
  else if (t.match(/kino|film|strikk|quiz|bok/)) collection = imageCollections.hobby;
  
  const idSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageId = collection[idSum % collection.length];
  return `https://images.unsplash.com/${imageId}?q=80&w=600&auto=format&fit=crop`;
};

export default function AktivitetDetalj() {
  const supabase = createClient();
  const { id } = useParams();
  const router = useRouter();
  const [aktivitet, setAktivitet] = useState<AktivitetType | null>(null);
  const [erPaameldt, setErPaameldt] = useState(false);
  const [antall, setAntall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      setCurrentUser(userRes.user);

      const { data: akt } = await supabase.from('activities').select('*').eq('id', id).single();
      if (akt) setAktivitet(akt);

      const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('activity_id', id);
      if (count !== null) setAntall(count);

      if (userRes.user && id) {
        const { data: sjekk } = await supabase.from('participants').select('*').eq('activity_id', id).eq('user_id', userRes.user.id).single();
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

  const slettAktivitet = async () => {
    if (confirm('Er du sikker på at du vil slette denne aktiviteten?')) {
        await supabase.from('activities').delete().eq('id', id);
        router.push('/');
    }
  }

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'#F8FAFC'}}><Loader2 className="animate-spin"/></div>;
  if (!aktivitet) return <div style={{padding:'40px', textAlign:'center'}}>Fant ikke aktiviteten.</div>;

  const erFullt = aktivitet.max_deltakere ? antall >= aktivitet.max_deltakere : false;
  const erEier = currentUser && currentUser.id === aktivitet.creator_id;
  const imageUrl = (aktivitet.image_url && aktivitet.image_url.length > 10) ? aktivitet.image_url : getSmartImage(aktivitet.tittel, aktivitet.id);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '10px 20px', borderRadius: '99px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 'bold', color: '#64748b', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={16} /> Tilbake
            </button>

            {erEier && (
                <div style={{display:'flex', gap:'12px'}}>
                    <Link href={`/aktivitet/${id}/rediger`} style={{background:'white', border:'1px solid #e2e8f0', padding:'10px', borderRadius:'50%', cursor:'pointer', color:'#334155', display:'flex', alignItems:'center', justifyContent:'center'}} title="Rediger"><Edit2 size={18}/></Link>
                    <button onClick={slettAktivitet} style={{background:'white', border:'1px solid #fee2e2', padding:'10px', borderRadius:'50%', cursor:'pointer', color:'#ef4444'}} title="Slett"><Trash2 size={18}/></button>
                </div>
            )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
            
            {/* VENSTRE SIDE */}
            <div style={{ flex: '2', minWidth: '300px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              
              <div style={{display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap'}}>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Aktivitet</span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display:'flex', alignItems:'center', gap:'6px' }}>
                    <Calendar size={14}/> {aktivitet.dato ? aktivitet.dato.split(',')[0] : ''}
                </span>
              </div>
              
              <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '32px', lineHeight: '1.1' }}>{aktivitet.tittel}</h1>
              
              {/* VÆRMELDING (Kun hvis < 4 dager til) */}
              <div style={{ marginBottom: '32px' }}>
                  <Weather adresse={aktivitet.sted} datoTekst={aktivitet.dato} />
              </div>

              <div style={{ paddingBottom: '32px', borderBottom: '1px solid #f1f5f9', marginBottom: '32px', color: '#334155', fontSize: '18px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {aktivitet.beskrivelse}
              </div>

              {erPaameldt ? (
                <div style={{marginTop:'20px'}}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize:'20px', color:'#0f172a' }}>💬 Samtale</h3>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}><Chat activityId={id as string} /></div>
                </div>
              ) : (
                <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '16px', color: '#1e40af', display: 'flex', gap: '16px', alignItems: 'center', border:'1px solid #dbeafe' }}>
                  <div style={{background:'white', padding:'10px', borderRadius:'50%'}}><Info size={24} /></div>
                  <div>
                      <p style={{fontWeight:'bold'}}>Lukket chat</p>
                      <p style={{ fontSize: '14px', opacity:0.8 }}>Meld deg på aktiviteten for å se beskjeder og snakke med de andre.</p>
                  </div>
                </div>
              )}
            </div>

            {/* HØYRE SIDE */}
            <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* BILDE */}
              <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                  <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
              </div>

              {/* PRIS */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                 <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Pris per person</p>
                 {aktivitet.price > 0 ? (
                    <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'32px', fontWeight:'900', color:'#059669'}}>
                        {aktivitet.price},- <span style={{fontSize:'14px', fontWeight:'bold', color:'#10b981'}}>NOK</span>
                    </div>
                 ) : (
                    <div style={{fontSize:'32px', fontWeight:'900', color:'#0f172a'}}>Gratis</div>
                 )}
              </div>

              {/* STATUS */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Ledige plasser</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                  <Users size={24} color="#0f172a" />
                  <span style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>
                    {antall} <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: '500' }}>/ {aktivitet.max_deltakere || '∞'}</span>
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
                      boxShadow: erPaameldt ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.2)'
                  }}
                >
                  {erPaameldt ? <><XCircle size={20}/> Meld meg av</> : erFullt ? 'Fullt' : <><CheckCircle size={20}/> Jeg blir med!</>}
                </button>
                
                {erPaameldt && (
                    <div style={{ marginTop:'16px', padding:'12px', background:'#f0fdf4', borderRadius:'12px', color:'#166534', fontWeight:'bold', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                        <CheckCircle size={16} /> Du er påmeldt!
                    </div>
                )}
              </div>

              {/* KART OG VEIBESKRIVELSE */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '12px', display: 'flex', gap: '8px', alignItems:'center', color:'#334155' }}>
                    <div style={{background:'#eff6ff', padding:'8px', borderRadius:'50%'}}><MapPin size={16} color="#2563eb"/></div>
                    {aktivitet.sted} {aktivitet.postnummer ? `, ${aktivitet.postnummer}` : ''}
                </p>
                <div style={{ height: '180px', borderRadius: '16px', overflow: 'hidden', border:'1px solid #e2e8f0', marginBottom:'12px' }}>
                    <Map adresse={aktivitet.sted} />
                </div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(aktivitet.sted)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' }}
                >
                  <Navigation size={16} /> Veibeskrivelse
                </a>
              </div>

            </div>

        </div>
      </div>
    </div>
  )
}
