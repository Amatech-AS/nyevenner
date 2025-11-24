'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { MapPin, Calendar, Search, Users, ArrowRight, Info, CheckCircle, Loader2, Smile, Heart } from 'lucide-react';
import LoginModal from '@/components/LoginModal';

type Aktivitet = { id: string; tittel: string; beskrivelse: string; dato: string; sted: string; postnummer: string; max_deltakere: number | null; image_url: string | null; }

// (Behold imageCollections og getSmartImage funksjonene her som før - for å spare plass i svaret klipper jeg dem ikke inn på nytt, men de MÅ være der!)
const imageCollections = {
  jul: [ 'photo-1543589077-47d81606c1bf', 'photo-1512389142860-9c449e58a543', 'photo-1576919228236-a097c32a5cd4', 'photo-1482517967863-00e15c9b4499', 'photo-1513297887119-d46091b24bfa' ],
  tur: [ 'photo-1551632811-561732d1e306', 'photo-1441974231531-c6227db76b6e', 'photo-1478131143081-80f7f84ca84d', 'photo-1501555088652-021faa106b9b', 'photo-1625246333195-78d9c38ad449' ],
  mat: [ 'photo-1511920170033-f8396924c348', 'photo-1559339352-11d035aa65de', 'photo-1528605248644-14dd04022da1', 'photo-1515003197210-e0cd71810b5f' ],
  hobby: [ 'photo-1606105886470-8b1e10222045', 'photo-1456735190827-d1261f794971', 'photo-1513364776144-60967b0f800f', 'photo-1520032525096-7bd04a94b5a4' ],
  default: [ 'photo-1511632765486-a01980e01a18', 'photo-1543269865-cbf427effbad', 'photo-1529156069898-49953e39b3ac', 'photo-1523301343968-63214359d56b' ]
};
const getSmartImage = (tittel: string, id: string) => {
  const t = tittel.toLowerCase();
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
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([]);
  const [mineAktiviteter, setMineAktiviteter] = useState<Aktivitet[]>([]);
  const [soketekst, setSoketekst] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userPostnummer, setUserPostnummer] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [kunNaerMeg, setKunNaerMeg] = useState(false); // FILTER

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
        // Hent brukerens postnummer
        const { data: profil } = await supabase.from('profiles').select('postnummer').eq('id', user.id).single();
        if (profil) setUserPostnummer(profil.postnummer);

        const { data: paameldinger } = await supabase.from('participants').select('activity_id').eq('user_id', user.id);
        // (Logikk for mineAktiviteter...)
        // For enkelhets skyld henter vi alt først
    }

    const { data: alle } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50);
    if (alle) {
        setAktiviteter(alle);
        if (user) {
             // Filtrer mine aktiviteter her
             const { data: p } = await supabase.from('participants').select('activity_id').eq('user_id', user.id);
             const mineIds = p?.map(x => x.activity_id) || [];
             setMineAktiviteter(alle.filter(a => mineIds.includes(a.id)));
        }
    }
    setLoading(false);
  };

  // FILTRERING LOGIKK
  const filtrerteAktiviteter = aktiviteter.filter(a => {
      const matcherSok = soketekst.trim() === '' || 
                         a.tittel.toLowerCase().includes(soketekst.toLowerCase()) || 
                         a.sted.toLowerCase().includes(soketekst.toLowerCase());
      
      if (!matcherSok) return false;

      // Nær meg logikk: Sjekk om de to første sifrene i postnummeret er like
      if (kunNaerMeg && userPostnummer && a.postnummer) {
          return a.postnummer.substring(0, 2) === userPostnummer.substring(0, 2);
      }
      return true;
  });

  const AktivitetFlis = ({ aktivitet, erMin = false }: { aktivitet: any, erMin?: boolean }) => {
    const imageUrl = getSmartImage(aktivitet.tittel, aktivitet.id);
    return (
      <Link href={`/aktivitet/${aktivitet.id}`} style={{ textDecoration: 'none' }} className="group h-full block">
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', border: erMin ? '2px solid #10B981' : '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s',
        }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ height: '140px', width: '100%', position: 'relative', backgroundColor: '#F1F5F9' }}>
             <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333' }}>{aktivitet.dato.split(',')[0]}</div>
             {erMin && <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#10B981', color:'white', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>Påmeldt</div>}
          </div>
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '4px', lineHeight: '1.2' }}>{aktivitet.tittel}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '16px', fontWeight: '600' }}><MapPin size={12} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aktivitet.sted}</span></div>
            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {aktivitet.max_deltakere || '∞'}</div>
              <ArrowRight size={16} color="#cbd5e1" />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ background: '#0f172a', padding: '10px', borderRadius: '12px', color: 'white', display: 'flex', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}><Smile size={24} strokeWidth={2.5} /></div>
             <div>
               <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', lineHeight: '1', letterSpacing: '-0.5px' }}>NyeVenner</h1>
               <Link href="/hvordan-virker-det" style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', textDecoration: 'underline' }}>Hvordan virker det?</Link>
             </div>
           </div>
           {user ? (
             <Link href="/minside" style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', background: 'white', padding: '10px 20px', borderRadius: '99px', border: '1px solid #e2e8f0', textDecoration: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>Min Side</Link>
           ) : (
             <Link href="/login" style={{ background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '99px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>Logg inn</Link>
           )}
        </div>

        {/* SØK OG FILTER */}
        <div style={{ maxWidth: '600px', margin: '0 auto 48px auto', display:'flex', gap:'12px', alignItems:'center' }}>
           <div style={{ position: 'relative', flex: 1 }}>
             <input placeholder="Søk..." value={soketekst} onChange={e=>setSoketekst(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '16px', fontWeight: '600', outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} />
             <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={20} /></div>
           </div>
           
           {/* FILTER KNAPP */}
           {user && (
             <button 
               onClick={() => setKunNaerMeg(!kunNaerMeg)}
               style={{ 
                 padding: '16px 24px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid', 
                 backgroundColor: kunNaerMeg ? '#eff6ff' : 'white', 
                 borderColor: kunNaerMeg ? '#2563eb' : '#e2e8f0',
                 color: kunNaerMeg ? '#1e3a8a' : '#64748b'
               }}
             >
               {kunNaerMeg ? '📍 Viser nær meg' : '🌍 Vis alle'}
             </button>
           )}
        </div>

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

            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Finn aktiviteter</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {filtrerteAktiviteter.map(a => <AktivitetFlis key={a.id} aktivitet={a} />)}
            </div>
            {filtrerteAktiviteter.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Fant ingen aktiviteter her. Prøv å søke bredere eller slå av "Nær meg".</div>
            )}
          </>
        )}

        <div style={{ marginTop: '80px', textAlign: 'center' }}>
           <Link href="/ny-aktivitet" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#10b981', color: 'white', padding: '18px 40px', borderRadius: '99px', fontWeight: 'bold', fontSize: '18px', textDecoration: 'none', boxShadow: '0 15px 30px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }}>
             + Lag en ny aktivitet
           </Link>
        </div>
      </div>
    </main>
  );
}