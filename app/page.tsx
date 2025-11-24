'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { MapPin, Calendar, Search, Users, ArrowRight, Info, CheckCircle, Loader2 } from 'lucide-react';
import LoginModal from '@/components/LoginModal';

type Aktivitet = { 
  id: string; 
  tittel: string; 
  beskrivelse: string; 
  dato: string; 
  sted: string; 
  max_deltakere: number | null; 
  image_url: string | null;
}

// --- SMART BILDEVELGER ---
// Vi definerer samlinger av trygge, fine bilder
const imageCollections = {
  jul: [
    'photo-1543589077-47d81606c1bf', // Juletre pynt
    'photo-1512389142860-9c449e58a543', // Snø og lys
    'photo-1576919228236-a097c32a5cd4', // Julekaker
    'photo-1482517967863-00e15c9b4499', // Gaver
    'photo-1513297887119-d46091b24bfa', // Peis og kos
  ],
  tur: [
    'photo-1551632811-561732d1e306', // Fjellsko
    'photo-1441974231531-c6227db76b6e', // Skog og sol
    'photo-1478131143081-80f7f84ca84d', // Camping/Tur
    'photo-1501555088652-021faa106b9b', // Fjellutsikt
    'photo-1625246333195-78d9c38ad449', // Gåtur i park
  ],
  mat: [
    'photo-1511920170033-f8396924c348', // Kaffe
    'photo-1559339352-11d035aa65de', // Vaffel/Kake
    'photo-1528605248644-14dd04022da1', // Middagsbord
    'photo-1515003197210-e0cd71810b5f', // Matlaging
  ],
  hobby: [
    'photo-1606105886470-8b1e10222045', // Strikking
    'photo-1456735190827-d1261f794971', // Bok
    'photo-1513364776144-60967b0f800f', // Maling/Kunst
    'photo-1520032525096-7bd04a94b5a4', // Hage
  ],
  default: [
    'photo-1511632765486-a01980e01a18', // Venner som prater
    'photo-1543269865-cbf427effbad', // Sosialt
    'photo-1529156069898-49953e39b3ac', // Smilende folk
    'photo-1523301343968-63214359d56b', // Håndtrykk/Fellesskap
  ]
};

// Funksjon som velger et bilde basert på tittel og ID (slik at det blir variert men fast)
const getSmartImage = (tittel: string, id: string) => {
  const t = tittel.toLowerCase();
  let collection = imageCollections.default;

  if (t.includes('jul') || t.includes('advent') || t.includes('lucia')) collection = imageCollections.jul;
  else if (t.includes('tur') || t.includes('gå') || t.includes('marka')) collection = imageCollections.tur;
  else if (t.includes('mat') || t.includes('kaffe') || t.includes('vaffel') || t.includes('middag')) collection = imageCollections.mat;
  else if (t.includes('strikk') || t.includes('bok') || t.includes('quiz') || t.includes('kino')) collection = imageCollections.hobby;

  // Bruk ID-en til å velge et "tilfeldig" bilde fra listen, som alltid er det samme for den aktiviteten
  // Vi summerer tegnkodene i ID-en for å få et tall
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function hentData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: alle } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (alle) setAktiviteter(alle);

      if (user) {
        const { data: paameldinger } = await supabase
          .from('participants')
          .select('activity_id')
          .eq('user_id', user.id);
        
        if (paameldinger && paameldinger.length > 0) {
          const mineIder = paameldinger.map(p => p.activity_id);
          const mine = alle?.filter(a => mineIder.includes(a.id)) || [];
          setMineAktiviteter(mine);
        }
      }
      setLoading(false);
    }
    hentData();
  }, []);

  const visAktiviteter = soketekst.trim() 
    ? aktiviteter.filter(a => a.tittel.toLowerCase().includes(soketekst.toLowerCase()) || a.sted.toLowerCase().includes(soketekst.toLowerCase()))
    : aktiviteter;

  // --- FLIS-KOMPONENT ---
  const AktivitetFlis = ({ aktivitet, erMin = false }: { aktivitet: Aktivitet, erMin?: boolean }) => {
    // Vi bruker den smarte bildevelgeren her i stedet for databasen
    const imageUrl = getSmartImage(aktivitet.tittel, aktivitet.id);

    return (
      <Link href={`/aktivitet/${aktivitet.id}`} style={{ textDecoration: 'none' }}>
        {/* BOKSEN */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: erMin ? '2px solid #10B981' : '1px solid #E2E8F0', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          
          {/* BILDE - Låst høyde og bredde (140px) */}
          <div style={{ height: '140px', width: '100%', position: 'relative', backgroundColor: '#F1F5F9' }}>
             <img 
               src={imageUrl} 
               alt="" 
               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             />
             {/* Dato lapp */}
             <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333' }}>
               {aktivitet.dato.split(' ')[0]}
             </div>
             {erMin && <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#10B981', color:'white', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>Påmeldt</div>}
          </div>

          {/* TEKST */}
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '4px', lineHeight: '1.2' }}>
              {aktivitet.tittel}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '16px', fontWeight: '600' }}>
              <MapPin size={12} /> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aktivitet.sted}</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Users size={12} /> {aktivitet.max_deltakere || '∞'}
              </div>
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

      {/* HEADER */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
           <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '32px' }}>🏡</span> NyeVenner
           </h1>
           {user ? (
             <Link href="/minside" style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', background: 'white', padding: '8px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', textDecoration: 'none' }}>Min Side</Link>
           ) : (
             <button onClick={() => setShowLoginModal(true)} style={{ background: '#0f172a', color: 'white', padding: '8px 20px', borderRadius: '99px', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer' }}>Logg inn</button>
           )}
        </div>

        {/* INTRO */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '99px', color: '#2563eb', display: 'block' }}>
                <Info size={24} />
            </div>
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Velkommen!</h3>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>Her finner du aktiviteter nær deg. Klikk på en flis for å lese mer.</p>
            </div>
        </div>

        {/* SØK */}
        <div style={{ maxWidth: '400px', margin: '0 auto 40px auto', position: 'relative' }}>
           <input 
             placeholder="Søk..." 
             value={soketekst} 
             onChange={e=>setSoketekst(e.target.value)} 
             style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '16px', fontWeight: '600', outline: 'none' }}
           />
           <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={20} /></div>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin"/></div> : (
          <>
            {mineAktiviteter.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Dine aktiviteter</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                  {mineAktiviteter.map(a => <AktivitetFlis key={a.id} aktivitet={a} erMin={true} />)}
                </div>
              </div>
            )}

            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Finn aktiviteter</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {visAktiviteter.map(a => <AktivitetFlis key={a.id} aktivitet={a} />)}
            </div>
          </>
        )}

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
           <Link href="/ny-aktivitet" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', padding: '16px 32px', borderRadius: '99px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
             + Lag en ny aktivitet
           </Link>
        </div>

      </div>
    </main>
  );
}