'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, ArrowRight, History, ArrowLeft, User, Heart, AlertTriangle, Star, MapPin, Coins, Edit2, Save, Phone, Cake, HelpCircle, CheckCircle } from 'lucide-react';

export default function MinSide() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  
  // Redigering
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    full_name: '', 
    address: '', 
    postnummer: '', 
    telefon: '', 
    birthdate: '' 
  });
  
  // Pårørende kobling input
  const [inputKode, setInputKode] = useState('');
  const [koblingsStatus, setKoblingsStatus] = useState('');

  // Data
  const [kommende, setKommende] = useState<any[]>([]);
  const [historikk, setHistorikk] = useState<any[]>([]);
  const [stats, setStats] = useState({ denneMnd: 0, totalt: 0, totalKostnad: 0 });
  const [relasjoner, setRelasjoner] = useState<any[]>([]);
  const [visHistorikk, setVisHistorikk] = useState(false);
  const [unlinkModal, setUnlinkModal] = useState<{ vis: boolean, id: string, navn: string, rolle: string } | null>(null);
  const [unlinkReason, setUnlinkReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/login');
        setUser(user);

        // Hent profil
        const { data: prof, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        // Hvis profil mangler, bruk data fra Google-login midlertidig
        const safeProfile = prof || { 
            id: user.id, 
            full_name: user.user_metadata?.full_name || '', 
            rolle: 'senior', // Default hvis mangler
            invite_code: 'NY' 
        };

        setProfil(safeProfile);
        
        // Fyll inn skjema
        setEditForm({ 
            full_name: safeProfile.full_name || '', 
            address: safeProfile.address || '', 
            postnummer: safeProfile.postnummer || '',
            telefon: safeProfile.telefon || '',
            birthdate: safeProfile.birthdate || '' 
        });
        
        let targetUserId = user.id;
        
        // Logikk for relasjoner (bare hvis vi faktisk har en rolle)
        if (safeProfile.rolle === 'senior') {
            const { data: links } = await supabase.from('family_links').select('relative_id').eq('senior_id', user.id);
            if (links && links.length > 0) {
            const ids = links.map(l => l.relative_id);
            const { data: rels } = await supabase.from('profiles').select('*').in('id', ids);
            setRelasjoner(rels || []);
            }
        } else if (safeProfile.rolle === 'familie') {
            const { data: links } = await supabase.from('family_links').select('senior_id').eq('relative_id', user.id);
            if (links && links.length > 0) {
            const ids = links.map(l => l.senior_id);
            const { data: rels } = await supabase.from('profiles').select('*').in('id', ids);
            setRelasjoner(rels || []);
            if (rels && rels.length > 0) targetUserId = rels[0].id; 
            }
        }

        // Hent aktiviteter
        const { data: paameldinger } = await supabase.from('participants').select('activity_id, created_at').eq('user_id', targetUserId);
        
        if (paameldinger && paameldinger.length > 0) {
            const ids = paameldinger.map(p => p.activity_id);
            const { data: akts } = await supabase.from('activities').select('*').in('id', ids).order('created_at', { ascending: false });
            
            if (akts) {
            setKommende(akts.slice(0, 3));
            setHistorikk(akts.slice(3));
            
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const thisYearActivities = akts.filter(a => new Date(a.created_at).getFullYear() === currentYear);
            const thisMonthActivities = akts.filter(a => {
                const d = new Date(a.created_at);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            });

            setStats({ 
                totalt: thisYearActivities.length, 
                denneMnd: thisMonthActivities.length, 
                totalKostnad: thisYearActivities.reduce((sum, a) => sum + (a.price || 0), 0) 
            });
            }
        }
      } catch (e) {
          console.error("Feil ved lasting av min side:", e);
      } finally {
          setLoading(false);
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    // Hvis profilen ikke finnes fra før (første google login uten trigger), insert. Ellers update.
    const updates = {
        id: user.id,
        ...editForm,
        updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (!error) {
        setProfil({ ...profil, ...editForm });
        setIsEditing(false);
    } else {
        alert('Kunne ikke lagre: ' + error.message);
    }
  };

  const kobleTilSenior = async () => {
    if (!inputKode) return;
    setKoblingsStatus('Leter...');
    
    const { data: seniorer } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('invite_code', inputKode.toUpperCase()); 
      
    const senior = seniorer && seniorer.length > 0 ? seniorer[0] : null;

    if (!senior) {
      setKoblingsStatus('Fant ingen med denne koden. Sjekk at den er skrevet riktig.');
      return;
    }

    const { error } = await supabase
      .from('family_links')
      .insert({ relative_id: user.id, senior_id: senior.id });

    if (error) {
      setKoblingsStatus('Dere er allerede koblet sammen.');
    } else {
      setKoblingsStatus(`Suksess! Koblet til ${senior.full_name}. Oppdaterer...`);
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  const handleUnlink = async () => {
    if (!unlinkModal || !user) return;
    if (profil.rolle === 'familie') {
        await supabase.from('family_links').delete().eq('relative_id', user.id).eq('senior_id', unlinkModal.id);
    } else {
        await supabase.from('family_links').delete().eq('senior_id', user.id).eq('relative_id', unlinkModal.id);
    }
    setRelasjoner(prev => prev.filter(r => r.id !== unlinkModal.id));
    setUnlinkModal(null);
    setUnlinkReason('');
  };

  const loggUt = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', fontFamily:'system-ui'}}><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* MODAL */}
      {unlinkModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>
              {profil.rolle === 'familie' ? 'Avslutt kobling?' : 'Fjern pårørende?'}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
              Er du sikker på at du vil fjerne koblingen til <strong>{unlinkModal.navn}</strong>?
            </p>
            {profil.rolle === 'familie' && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#334155' }}>Vennligst angi årsak:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="radio" name="reason" value="not_needed" onChange={e => setUnlinkReason(e.target.value)} />
                    <span>Vi trenger ikke koblingen lenger</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="radio" name="reason" value="passed_away" onChange={e => setUnlinkReason(e.target.value)} />
                    <span>Brukeren har gått bort 🌹</span>
                  </label>
                </div>
              </div>
            )}
            {unlinkReason === 'passed_away' && (<div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#166534', fontSize: '14px' }}>Takk for at du ga oss beskjed. Vi kondolerer. Når du bekrefter, vil koblingen fjernes fra din oversikt umiddelbart.</div>)}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleUnlink} style={{ flex: 1, padding: '16px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Bekreft</button>
              <button onClick={() => setUnlinkModal(null)} style={{ flex: 1, padding: '16px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontWeight: 'bold', fontSize: '14px' }}><ArrowLeft size={16}/> Tilbake</Link>
            <button onClick={loggUt} style={{ border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', display: 'flex', gap: '8px', fontSize: '14px' }}><LogOut size={16}/> Logg ut</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* PROFILKORT */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
             <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>Min Profil</h1>
                <p style={{ color: '#64748b' }}>
                    {profil?.address ? 'Her er informasjonen vi har om deg.' : 'Velkommen! Vennligst fyll ut informasjonen din.'}
                </p>
             </div>
             <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isEditing ? '#10b981' : '#f1f5f9', color: isEditing ? 'white' : '#475569', padding: '10px 20px', borderRadius: '99px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEditing ? <><Save size={16}/> Lagre</> : <><Edit2 size={16}/> Endre</>}
             </button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
             {/* NAVN */}
             <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Navn</label>
                {isEditing ? (
                    <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
                ) : (
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>{profil?.full_name}</p>
                )}
             </div>
             
             {/* ADRESSE */}
             <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Adresse</label>
                {isEditing ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Gateadresse" />
                        <input value={editForm.postnummer} onChange={e => setEditForm({...editForm, postnummer: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Postnr" />
                    </div>
                ) : (
                    <p style={{ fontSize: '18px', fontWeight: '500', color: '#334155', display:'flex', alignItems:'center', gap:'8px' }}>
                        <MapPin size={18} className="text-slate-400"/> {profil?.address || ''} {profil?.postnummer ? `, ${profil.postnummer}` : '(Mangler adresse)'}
                    </p>
                )}
             </div>

             {/* TELEFON OG FØDSELSDATO */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Telefon</label>
                    {isEditing ? (
                        <input value={editForm.telefon} onChange={e => setEditForm({...editForm, telefon: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Tlf" />
                    ) : (
                        <p style={{ fontSize: '18px', fontWeight: '500', color: '#334155', display:'flex', alignItems:'center', gap:'8px' }}>
                            <Phone size={18} className="text-slate-400"/> {profil?.telefon || '-'}
                        </p>
                    )}
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Fødselsdato</label>
                    {isEditing ? (
                        <input type="date" value={editForm.birthdate} onChange={e => setEditForm({...editForm, birthdate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
                    ) : (
                        <p style={{ fontSize: '18px', fontWeight: '500', color: '#334155', display:'flex', alignItems:'center', gap:'8px' }}>
                            <Cake size={18} className="text-slate-400"/> {profil?.birthdate || '-'}
                        </p>
                    )}
                </div>
             </div>
          </div>
          
          {profil?.rolle === 'senior' && (
             <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d97706', marginBottom: '8px' }}>Din kode for pårørende</p>
                <div style={{ display: 'inline-block', background: '#fffbeb', color: '#b45309', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', padding: '12px 24px', borderRadius: '12px', border: '2px dashed #fcd34d' }}>
                    {profil?.invite_code || '---'}
                </div>
             </div>
          )}
        </div>

        {/* PÅRØRENDE KOBLING (Vises KUN hvis jeg er familie og IKKE har relasjoner enda) */}
        {profil?.rolle === 'familie' && relasjoner.length === 0 && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Koble til en bruker</h2>
                
                {/* HJELPETEKST */}
                <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #dbeafe' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', color: '#1e40af' }}>
                        <HelpCircle size={20} /> <span style={{ fontWeight: 'bold' }}>Slik fungerer det:</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.5' }}>
                        For å hjelpe en senior, trenger du deres unike kode. 
                        Senioren finner denne koden på sin egen "Min Side".
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                        value={inputKode} 
                        onChange={e => setInputKode(e.target.value)} 
                        placeholder="Skriv kode (f.eks. TUR-123)" 
                        style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', textTransform: 'uppercase', fontWeight: 'bold' }} 
                    />
                    <button onClick={kobleTilSenior} style={{ padding: '16px 32px', backgroundColor: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                        Koble til
                    </button>
                </div>
                {koblingsStatus && <p style={{ marginTop: '16px', fontWeight: 'bold', color: koblingsStatus.includes('Suksess') ? '#16a34a' : '#dc2626' }}>{koblingsStatus}</p>}
            </div>
        )}

        {/* RELASJONER */}
        {relasjoner.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>
                    {profil?.rolle === 'familie' ? 'Du følger:' : 'Dine pårørende:'}
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                    {relasjoner.map(rel => (
                        <div key={rel.id} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><User size={20}/></div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', color: '#0f172a' }}>{rel.full_name}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>{rel.address ? `${rel.address}, ${rel.postnummer}` : 'Ingen adresse'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setUnlinkModal({ vis: true, id: rel.id, navn: rel.full_name, rolle: profil.rolle === 'familie' ? 'senior' : 'familie' })} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Fjern</button>
                            </div>
                            {profil.rolle === 'familie' && (
                                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ flex: 1, background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>Aktiviteter i år</p>
                                        <p style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{stats.totalt}</p>
                                    </div>
                                    <div style={{ flex: 1, background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#059669' }}>Penger brukt</p>
                                        <p style={{ fontSize: '20px', fontWeight: '900', color: '#059669' }}>{stats.totalKostnad},-</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* STATISTIKK */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom:'40px' }}>
            <div style={{ flex: 1, background: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284c7' }}><Star size={20} fill="#0284c7" /> <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Hittil i år</span></div>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#0c4a6e' }}>{stats.totalt}</p>
                {profil?.rolle === 'familie' && <p style={{fontSize:'12px', color:'#0284c7'}}>Aktiviteter for din senior</p>}
            </div>
            <div style={{ flex: 1, background: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#059669' }}><Coins size={20} /> <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Brukt (NOK)</span></div>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#064e3b' }}>{stats.totalKostnad},-</p>
            </div>
        </div>

        {/* AKTIVITETER LISTE (GRID) */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} className="text-blue-600"/> {profil?.rolle === 'familie' ? 'Deres planlagte aktiviteter' : 'Dine planlagte aktiviteter'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {kommende.length === 0 && (<div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>Ingen kommende aktiviteter.</div>)}
            {kommende.map(a => (
              <Link href={`/aktivitet/${a.id}`} key={a.id} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'8px'}}><span style={{fontSize:'10px', fontWeight:'bold', background:'#eff6ff', color:'#2563eb', padding:'4px 8px', borderRadius:'6px'}}>{a.dato.split(',')[0]}</span></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '4px', lineHeight: '1.2' }}>{a.tittel}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '16px', fontWeight: '600' }}><MapPin size={12} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sted}</span></div>
                        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px', color:'#059669' }}><CheckCircle size={14} /> Du er påmeldt</div><ArrowRight size={16} color="#cbd5e1" /></div>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* HISTORIKK */}
        <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
            <button onClick={() => setVisHistorikk(!visHistorikk)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}><History size={18}/> {visHistorikk ? 'Skjul historikk' : 'Se hva du har vært med på tidligere'}</button>
            {visHistorikk && (
            <div style={{ marginTop: '24px', opacity: '0.6', display: 'grid', gap: '16px' }}>
                {historikk.map(a => (
                <div key={a.id} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}><h4 style={{ fontWeight: 'bold', color: '#475569', textDecoration: 'line-through' }}>{a.tittel}</h4><span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>Gjennomført</span></div>
                ))}
                {historikk.length === 0 && <p style={{ fontSize: '14px', color: '#94a3b8' }}>Ingen historikk enda.</p>}
            </div>
            )}
        </div>

      </div>
    </div>
  )
}