'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, ArrowRight, History, ArrowLeft, User, Heart, UserMinus, X, AlertTriangle, Trophy, Star, MapPin, Coins, Edit2, Save, Gift, BellOff, Phone } from 'lucide-react';

export default function MinSide() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  
  // Redigering
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', postnummer: '', telefon: '', fodselsdato: '', reservasjon_sms: false, reservasjon_epost: false });
  
  const [kommende, setKommende] = useState<any[]>([]);
  const [historikk, setHistorikk] = useState<any[]>([]);
  const [stats, setStats] = useState({ denneMnd: 0, totalt: 0, totalKostnad: 0 });
  const [relasjoner, setRelasjoner] = useState<any[]>([]);
  
  const [visHistorikk, setVisHistorikk] = useState(false);
  const [unlinkModal, setUnlinkModal] = useState<{ vis: boolean, id: string, navn: string, rolle: string } | null>(null);
  const [unlinkReason, setUnlinkReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectCode, setConnectCode] = useState('');
  const [connectMsg, setConnectMsg] = useState('');
  
  // Bursdag
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfil(prof);
      setEditForm({ 
          full_name: prof.full_name || '', 
          address: prof.address || '', 
          postnummer: prof.postnummer || '',
          telefon: prof.telefon || '',
          fodselsdato: prof.fodselsdato || '',
          reservasjon_sms: prof.reservasjon_sms || false,
          reservasjon_epost: prof.reservasjon_epost || false
      });

      // Sjekk bursdag
      if (prof.fodselsdato) {
        const today = new Date();
        const birth = new Date(prof.fodselsdato);
        if (today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth()) {
            setIsBirthday(true);
        }
      }

      let targetUserId = user.id;
      
      if (prof.rolle === 'senior') {
        const { data: links } = await supabase.from('family_links').select('relative_id').eq('senior_id', user.id);
        if (links && links.length > 0) {
           const ids = links.map(l => l.relative_id);
           const { data: rels } = await supabase.from('profiles').select('*').in('id', ids);
           setRelasjoner(rels || []);
        }
      } else if (prof.rolle === 'familie') {
        const { data: links } = await supabase.from('family_links').select('senior_id').eq('relative_id', user.id);
        if (links && links.length > 0) {
           const ids = links.map(l => l.senior_id);
           const { data: rels } = await supabase.from('profiles').select('*').in('id', ids);
           setRelasjoner(rels || []);
           if (rels && rels.length > 0) targetUserId = rels[0].id; 
        }
      }

      const { data: paameldinger } = await supabase.from('participants').select('activity_id').eq('user_id', targetUserId);
      if (paameldinger && paameldinger.length > 0) {
        const ids = paameldinger.map(p => p.activity_id);
        const { data: akts } = await supabase.from('activities').select('*').in('id', ids).order('created_at', { ascending: false });
        if (akts) {
          setKommende(akts.slice(0, 3));
          setHistorikk(akts.slice(3));
          setStats({ 
            totalt: akts.length, 
            denneMnd: Math.min(akts.length, 3), 
            totalKostnad: akts.reduce((sum, a) => sum + (a.price || 0), 0) 
          });
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update(editForm).eq('id', user.id);
    if (!error) {
        setProfil({ ...profil, ...editForm });
        setIsEditing(false);
        // Sjekk bursdag på nytt etter lagring
        if (editForm.fodselsdato) {
            const today = new Date();
            const birth = new Date(editForm.fodselsdato);
            if (today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth()) setIsBirthday(true);
            else setIsBirthday(false);
        }
    } else {
        alert('Kunne ikke lagre: ' + error.message);
    }
  };

  const handleConnect = async () => {
    if (!connectCode) return;
    const { data: target } = await supabase.from('profiles').select('*').eq('invite_code', connectCode.toUpperCase()).single();
    if (!target) return setConnectMsg('Fant ingen med koden.');
    const { error } = await supabase.from('family_links').insert({ relative_id: user.id, senior_id: target.id });
    if (!error) { setConnectMsg('Suksess!'); window.location.reload(); } else setConnectMsg('Allerede koblet.');
  };

  const handleUnlink = async () => {
    if (!unlinkModal || !user) return;
    if (profil.rolle === 'familie') {
        await supabase.from('family_links').delete().eq('relative_id', user.id).eq('senior_id', unlinkModal.id);
    } else {
        await supabase.from('family_links').delete().eq('senior_id', user.id).eq('relative_id', unlinkModal.id);
    }
    setRelasjoner(prev => prev.filter(r => r.id !== unlinkModal.id));
    setUnlinkModal(null);
  };

  const loggUt = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', fontFamily:'system-ui'}}><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* BURSDAGSKONFETTI (Bare CSS-animasjon av emojis) */}
      {isBirthday && (
         <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:50, overflow:'hidden', display:'flex', justifyContent:'center' }}>
            <div style={{ fontSize:'40px', animation: 'fall 3s linear infinite', position:'absolute', left:'10%' }}>🎉</div>
            <div style={{ fontSize:'40px', animation: 'fall 4s linear infinite', position:'absolute', left:'30%' }}>🎈</div>
            <div style={{ fontSize:'40px', animation: 'fall 2.5s linear infinite', position:'absolute', left:'50%' }}>🎂</div>
            <div style={{ fontSize:'40px', animation: 'fall 3.5s linear infinite', position:'absolute', left:'70%' }}>🎊</div>
            <div style={{ fontSize:'40px', animation: 'fall 3s linear infinite', position:'absolute', left:'90%' }}>🎁</div>
            <style jsx>{`
                @keyframes fall { 0% { top: -50px; opacity: 1; transform: rotate(0deg); } 100% { top: 100vh; opacity: 0; transform: rotate(360deg); } }
            `}</style>
         </div>
      )}

      {unlinkModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>{profil.rolle === 'familie' ? 'Avslutt kobling?' : 'Fjern pårørende?'}</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Vil du fjerne koblingen til <strong>{unlinkModal.navn}</strong>?</p>
            {profil.rolle === 'familie' && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#334155' }}>Vennligst angi årsak:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="radio" name="reason" value="not_needed" onChange={e => setUnlinkReason(e.target.value)} /> <span>Vi trenger ikke koblingen lenger</span></label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="radio" name="reason" value="passed_away" onChange={e => setUnlinkReason(e.target.value)} /> <span>Brukeren har gått bort 🌹</span></label>
                </div>
              </div>
            )}
            {unlinkReason === 'passed_away' && (<div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#166534', fontSize: '14px' }}>Takk for at du ga oss beskjed. Vi kondolerer.</div>)}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleUnlink} style={{ flex: 1, padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Bekreft fjerning</button>
              <button onClick={() => setUnlinkModal(null)} style={{ flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontWeight: 'bold', fontSize: '14px' }}><ArrowLeft size={16}/> Tilbake</Link>
            <button onClick={loggUt} style={{ border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', display: 'flex', gap: '8px', fontSize: '14px' }}><LogOut size={16}/> Logg ut</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* BURSDAGSHILSEN */}
        {isBirthday && (
            <div style={{ marginBottom:'32px', padding:'32px', background:'linear-gradient(135deg, #f472b6, #db2777)', borderRadius:'24px', color:'white', textAlign:'center', boxShadow:'0 10px 30px -5px rgba(219, 39, 119, 0.4)' }}>
                <h1 style={{ fontSize:'32px', fontWeight:'900', marginBottom:'8px' }}>Gratulerer med dagen! 🎂</h1>
                <p style={{ fontSize:'18px', opacity:'0.9' }}>Vi håper du får en strålende dag!</p>
            </div>
        )}

        {/* PROFILKORT */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
             <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>Min Profil</h1>
                <p style={{ color: '#64748b' }}>Her er informasjonen vi har om deg.</p>
             </div>
             <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isEditing ? '#10b981' : '#f1f5f9', color: isEditing ? 'white' : '#475569', padding: '10px 20px', borderRadius: '99px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEditing ? <><Save size={16}/> Lagre</> : <><Edit2 size={16}/> Endre</>}
             </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
             <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>NAVN</label>{isEditing ? <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} /> : <p style={{ fontSize: '18px', fontWeight: '600' }}>{profil?.full_name}</p>}</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>FØDSELSDATO</label>{isEditing ? <input type="date" value={editForm.fodselsdato} onChange={e => setEditForm({...editForm, fodselsdato: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} /> : <p style={{ fontSize: '18px', fontWeight: '500' }}>{profil?.fodselsdato || '-'}</p>}</div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>TELEFON</label>{isEditing ? <input value={editForm.telefon} onChange={e => setEditForm({...editForm, telefon: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} /> : <p style={{ fontSize: '18px', fontWeight: '500' }}>{profil?.telefon || '-'}</p>}</div>
             </div>
             
             {/* VARSLINGER (Kun i edit mode) */}
             {isEditing && (
                 <div style={{ background:'#f8fafc', padding:'16px', borderRadius:'12px', border:'1px solid #e2e8f0' }}>
                    <p style={{ fontSize:'12px', fontWeight:'bold', color:'#64748b', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}><BellOff size={14}/> RESERVASJONER MOT VARSLING</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        <label style={{display:'flex', gap:'8px', alignItems:'center'}}><input type="checkbox" checked={editForm.reservasjon_sms} onChange={e => setEditForm({...editForm, reservasjon_sms: e.target.checked})} /> <span>Jeg vil IKKE ha SMS</span></label>
                        <label style={{display:'flex', gap:'8px', alignItems:'center'}}><input type="checkbox" checked={editForm.reservasjon_epost} onChange={e => setEditForm({...editForm, reservasjon_epost: e.target.checked})} /> <span>Jeg vil IKKE ha E-post</span></label>
                    </div>
                 </div>
             )}
          </div>

          {profil?.rolle === 'senior' && (
             <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d97706', marginBottom: '8px' }}>DIN KODE FOR PÅRØRENDE</p>
                <div style={{ display: 'inline-block', background: '#fffbeb', color: '#b45309', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', padding: '12px 24px', borderRadius: '12px', border: '2px dashed #fcd34d' }}>{profil?.invite_code}</div>
             </div>
          )}
        </div>

        {/* RELASJONER (Beholdt samme logikk som før, men i ny fil) */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>
                {profil?.rolle === 'familie' ? 'Du følger:' : 'Dine pårørende:'}
            </h2>
            {relasjoner.length === 0 ? (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                    <p style={{ marginBottom: '12px', color: '#64748b' }}>Legg til en kode for å koble til en venn eller pårørende:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={connectCode} onChange={e => setConnectCode(e.target.value)} placeholder="KODE (f.eks. TUR-123)" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', textTransform: 'uppercase', textAlign: 'center', width:'180px', fontWeight:'bold' }} />
                        <button onClick={handleConnect} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Koble til</button>
                    </div>
                    {connectMsg && <p style={{ marginTop: '8px', fontWeight: 'bold' }}>{connectMsg}</p>}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {relasjoner.map(rel => (
                        <div key={rel.id} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><User size={20}/></div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', color: '#0f172a' }}>{rel.full_name}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>{rel.address ? `${rel.address}, ${rel.postnummer}` : 'Ingen adresse'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setUnlinkModal({ vis: true, id: rel.id, navn: rel.full_name, rolle: 'familie' })} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Fjern</button>
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
            )}
        </div>

        {/* AKTIVITETER & HISTORIKK */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} className="text-blue-600"/> {profil?.rolle === 'familie' && relasjoner.length > 0 ? 'Deres aktiviteter' : 'Dine aktiviteter'}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {kommende.map(a => (
              <Link href={`/aktivitet/${a.id}`} key={a.id} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>{a.tittel}</h4>
                    <p style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '16px', fontWeight: '500' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {a.dato}</span></p>
                  </div>
                  <ArrowRight size={20} color="#cbd5e1"/>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
            <button onClick={() => setVisHistorikk(!visHistorikk)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}><History size={18}/> {visHistorikk ? 'Skjul historikk' : 'Se hva du har vært med på tidligere'}</button>
            {visHistorikk && (
            <div style={{ marginTop: '24px', opacity: '0.6', display: 'grid', gap: '16px' }}>
                {historikk.map(a => (
                <div key={a.id} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#475569', textDecoration: 'line-through' }}>{a.tittel}</h4>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>Gjennomført</span>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>

      </div>
    </div>
  )
}
