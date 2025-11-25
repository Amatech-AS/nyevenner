'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { MapPin, Calendar, Search, Users, ArrowRight, Info, CheckCircle, Loader2, Trash2, Edit2, Plus } from 'lucide-react';
import LoginModal from '@/components/LoginModal';

type Aktivitet = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string; postnummer: string; max_deltakere: number | null; image_url: string | null; creator_id: string; }

// --- SMART BILDEVELGER ---
const imageCollections = {
  jul: [ 'photo-1543589077-47d81606c1bf', 'photo-1512389142860-9c449e58a543', 'photo-1576919228236-a097c32a5cd4', 'photo-1482517967863-00e15c9b4499', 'photo-1513297887119-d46091b24bfa' ],
  tur: [ 'photo-1551632811-561732d1e306', 'photo-1441974231531-c6227db76b6e', 'photo-1478131143081-80f7f84ca84d', 'photo-1501555088652-021faa106b9b', 'photo-1625246333195-78d9c38ad449' ],
  mat: [ 'photo-1511920170033-f8396924c348', 'photo-1559339352-11d035aa65de', 'photo-1528605248644-14dd04022da1', 'photo-1515003197210-e0cd71810b5f' ],
  hobby: [ 'photo-1606105886470-8b1e10222045', 'photo-1456735190827-d1261f794971', 'photo-1513364776144-60967b0f800f', 'photo-1520032525096-7bd04a94b5a4' ],
  default: [ 'photo-1511632765486-a01980e01a18', 'photo-1543269865-cbf427effbad', 'photo-1529156069898-49953e39b3ac', 'photo-1523301343968-63214359d56b' ]
};

const getSmartImage = (tittel: string, id: string) => {
  const t = tittel ? tittel.toLowerCase() : '';
  let collection = imageCollections.default;
  if (t.includes('jul') || t.includes('advent') || t.includes('lucia')) collection = imageCollections.jul;
  else if (t.includes('tur') || t.includes('gå') || t.includes('marka')) collection = imageCollections.tur;
  else if (t.includes('mat') || t.includes('kaffe') || t.includes('vaffel') || t.includes('middag')) collection = imageCollections.mat;
  else if (t.includes('strikk') || t.includes('bok') || t.includes('quiz') || t.includes('kino')) collection = imageCollections.hobby;
  
  const idSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageId = collection[idSum % collection.length];
  return `https://images.unsplash.com/${imageId}?q=80&w=400&auto=format&fit=crop`;
};

export default function LandingPage() {
  const supabase = createClient();
  const [aktiviteter, setAktiviteter] = useState<any[]>([]);
  const [mineAktiviteter, setMineAktiviteter] = useState<any[]>([]);
  const [soketekst, setSoketekst] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userPostnummer, setUserPostnummer] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [kunNaerMeg, setKunNaerMeg] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
        const { data: profil } = await supabase.from('profiles').select('postnummer').eq('id', user.id).single();
        if (profil) setUserPostnummer(profil.postnummer);
    }

    const { data: alle } = await supabase.from('activities').select('*, participants(count)').order('created_at', { ascending: false }).limit(50);
    
    if (alle) {
        const formatted = alle.map(a => ({ 
          ...a, 
          deltakere_count: a.participants ? a.participants[0]?.count : 0 
        }));
        setAktiviteter(formatted);
        if (user) {
             const { data: p } = await supabase.from('participants').select('activity_id').eq('user_id', user.id);
             const mineIds = p?.map(x => x.activity_id) || [];
             setMineAktiviteter(formatted.filter(a => mineIds.includes(a.id)));
        }
    }
    setLoading(false);
  };

  const slettAktivitet = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne aktiviteten?')) {
      await supabase.from('activities').delete().eq('id', id);
      fetchData(); 
    }
  };

  const filtrerteAktiviteter = aktiviteter.filter(a => {
      const matcherSok = soketekst.trim() === '' || 
                         a.tittel.toLowerCase().includes(soketekst.toLowerCase()) || 
                         a.sted.toLowerCase().includes(soketekst.toLowerCase());
      if (!matcherSok) return false;
      if (kunNaerMeg && userPostnummer && a.postnummer) {
          return a.postnummer.substring(0, 2) === userPostnummer.substring(0, 2);
      }
      return true;
  });

  const AktivitetFlis = ({ aktivitet, erMin = false }: { aktivitet: any, erMin?: boolean }) => {
    // FIX: Sjekker om image_url finnes, hvis ikke bruk smart-bilde
    const imageUrl = aktivitet.image_url && aktivitet.image_url.length > 10 
      ? aktivitet.image_url 
      : getSmartImage(aktivitet.tittel, aktivitet.id);
    
    const erFullt = aktivitet.max_deltakere && aktivitet.deltakere_count >= aktivitet.max_deltakere;
    const erEier = user && user.id === aktivitet.creator_id;

    return (
      <div className="group h-full relative">
        <Link href={`/aktivitet/${aktivitet.id}`} style={{ textDecoration: 'none' }} className="block h-full">
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', border: erMin ? '2px solid #10B981' : '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            
            <div style={{ height: '160px', width: '100%', position: 'relative', backgroundColor: '#F1F5F9' }}>
               <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: erFullt && !erMin ? 0.5 : 1 }} />
               
               <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display:'flex', justifyContent:'space-between' }}>
                 <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', padding: '4px 8px', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'4px' }}>
                    <Calendar size={12}/> {aktivitet.dato ? aktivitet.dato.split(' ')[0] : ''}
                 </div>
                 <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', padding: '4px 8px', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                    {aktivitet.dato ? aktivitet.dato.split('kl')[1] : ''}
                 </div>
               </div>

               {erFullt && !erMin && (
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', transform: 'rotate(-5deg)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>FULLT</div>
                 </div>
               )}
               
               {erMin && <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: '#10B981', color:'white', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'4px' }}><CheckCircle size={12}/> Påmeldt</div>}
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '4px', lineHeight: '1.2' }}>{aktivitet.tittel}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '16px', fontWeight: '600' }}><MapPin size={12} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aktivitet.sted}</span></div>
              
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <Users size={12} className={erFullt ? 'text-red-500' : 'text-blue-500'} /> 
                   <span>Antall: {aktivitet.deltakere_count} {aktivitet.max_deltakere ? `/ ${aktivitet.max_deltakere}` : ''}</span>
                </div>
                <ArrowRight size={16} color="#cbd5e1" />
              </div>
            </div>
          </div>
        </Link>

        {erEier && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 20 }}>
            {/* FIKS: Link til redigeringssiden som faktisk finnes */}
            <Link href={`/aktivitet/${aktivitet.id}/rediger`} onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '6px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#334155' }}>
              <Edit2 size={14}/>
            </Link>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); slettAktivitet(aktivitet.id); }} style={{ background: 'white', padding: '6px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={14}/>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '60px' }}>
           
           <div style={{ flex: '1 1 150px', display: 'flex', justifyContent: 'flex-start' }}>
             <Link href="/ny-aktivitet" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a', background: 'white', padding: '10px 20px', borderRadius: '99px', border: '1px solid #e2e8f0', textDecoration: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
               <Plus size={16}/> <span className="hidden sm:inline">Lag aktivitet</span><span className="sm:hidden">Ny</span>
             </Link>
           </div>

           {/* NY LOGO (Font Serif, Stor, Tynnere) */}
           <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
             <h1 style={{ fontFamily: 'Times New Roman, serif', fontSize: '48px', fontWeight: '300', color: '#0f172a', lineHeight: '1', letterSpacing: '2px', margin: 0 }}>
                NyeVenner
             </h1>
             <p style={{ fontSize: '11px', fontWeight: '600', color: '#059669', textTransform: 'uppercase', letterSpacing: '3px', marginTop: '6px' }}>Relasjoner skapes hele livet</p>
           </div>

           <div style={{ flex: '1 1 150px', display: 'flex', justifyContent: 'flex-end' }}>
             {user ? (
               <Link href="/minside" style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', background: 'white', padding: '10px 20px', borderRadius: '99px', border: '1px solid #e2e8f0', textDecoration: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>Min Side</Link>
             ) : (
               <Link href="/login" style={{ background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '99px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>Logg inn</Link>
             )}
           </div>
        </div>

        {/* SØK & SALGSPITCH */}
        <div style={{ maxWidth: '600px', margin: '0 auto 48px auto' }}>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <input placeholder="Søk etter aktivitet..." value={soketekst} onChange={e=>setSoketekst(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '16px', fontWeight: '600', outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} />
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={20} /></div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Finn fellesskapet du savner</h2>
                <p style={{ color: '#475569', marginBottom: '16px', lineHeight: '1.5' }}>
                    NyeVenner gjør det enkelt å finne noen å dele hverdagen med. 
                    Turer, kaffe-treff og hyggelige folk i ditt nabolag.
                </p>
                <Link href="/hvordan-virker-det" style={{ color: '#059669', fontWeight: 'bold', fontSize: '14px', textDecoration: 'underline' }}>
                    Les mer om hvordan det fungerer →
                </Link>
            </div>
        </div>

        {/* FILTER TABS */}
        {user && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
                <button onClick={() => setKunNaerMeg(false)} style={{ padding: '10px 24px', borderRadius: '99px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', backgroundColor: !kunNaerMeg ? '#0f172a' : '#e2e8f0', color: !kunNaerMeg ? 'white' : '#64748b' }}>Vis alle</button>
                <button onClick={() => setKunNaerMeg(true)} style={{ padding: '10px 24px', borderRadius: '99px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', backgroundColor: kunNaerMeg ? '#0f172a' : '#e2e8f0', color: kunNaerMeg ? 'white' : '#64748b' }}>📍 Nær meg</button>
            </div>
        )}

        {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin"/></div> : (
          <>
            {mineAktiviteter.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Dine planlagte aktiviteter</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                  {mineAktiviteter.map(a => <AktivitetFlis key={a.id} aktivitet={a} erMin={true} />)}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {filtrerteAktiviteter.map(a => <AktivitetFlis key={a.id} aktivitet={a} />)}
            </div>
            {filtrerteAktiviteter.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Fant ingen aktiviteter.</div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
