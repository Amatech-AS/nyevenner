'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, ArrowRight, History, ArrowLeft, User, Heart, UserMinus, X, AlertTriangle, Trophy, Star, MapPin, Coins, UserPlus } from 'lucide-react';

export default function MinSide() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  
  const [kommende, setKommende] = useState<any[]>([]);
  const [historikk, setHistorikk] = useState<any[]>([]);
  const [stats, setStats] = useState({ denneMnd: 0, totalt: 0, totalKostnad: 0 });
  const [relasjoner, setRelasjoner] = useState<any[]>([]);
  
  const [visHistorikk, setVisHistorikk] = useState(false);
  const [unlinkModal, setUnlinkModal] = useState<{ vis: boolean, id: string, navn: string, rolle: string } | null>(null);
  const [unlinkReason, setUnlinkReason] = useState('');
  const [loading, setLoading] = useState(true);

  // NYTT: Koble til kode
  const [connectCode, setConnectCode] = useState('');
  const [connectMsg, setConnectMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfil(prof);

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
          const totalt = akts.length;
          const denneMnd = Math.min(totalt, 3); 
          const totalKostnad = akts.reduce((sum, a) => sum + (a.price || 0), 0);

          setStats({ totalt, denneMnd, totalKostnad });
        }
      }
      setLoading(false);
  };

  const handleConnect = async () => {
    if (!connectCode) return;
    setLoading(true);
    // Finn senior med denne koden
    const { data: senior } = await supabase.from('profiles').select('*').eq('invite_code', connectCode.toUpperCase()).single();
    
    if (!senior) {
        setConnectMsg('Fant ingen med denne koden.');
        setLoading(false);
        return;
    }

    // Lagre kobling
    const { error } = await supabase.from('family_links').insert({
        relative_id: user.id,
        senior_id: senior.id
    });

    if (error) {
        setConnectMsg('Allerede koblet, eller feil oppstod.');
    } else {
        setConnectMsg('Suksess! Koblet til ' + senior.full_name);
        setConnectCode('');
        loadData(); // Last inn siden på nytt
    }
    setLoading(false);
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
    setUnlinkReason('');
  };

  const loggUt = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', fontFamily:'system-ui'}}><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      
      {unlinkModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>{profil.rolle === 'familie' ? 'Avslutt kobling?' : 'Fjern pårørende?'}</h3>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>Er du sikker på at du vil fjerne koblingen til <strong>{unlinkModal.navn}</strong>?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleUnlink} style={{ flex: 1, padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Bekreft fjerning</button>
              <button onClick={() => setUnlinkModal(null)} style={{ flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontWeight: 'bold', fontSize: '14px' }}>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '50%' }}><ArrowLeft size={16}/></div> Tilbake til startsiden
            </Link>
            <button onClick={loggUt} style={{ border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', display: 'flex', gap: '8px', fontSize: '14px' }}><LogOut size={16}/> Logg ut</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>{profil?.rolle === 'familie' ? `Hei, ${profil?.full_name}` : `Hei på deg, ${profil?.full_name || 'Venn'}! 👋`}</h1>
            {profil?.rolle === 'familie' && relasjoner.length > 0 ? (<p style={{ color: '#64748b', fontSize: '16px' }}>Her ser du aktivitetene til <strong>{relasjoner[0].full_name}</strong>.</p>) : (<p style={{ color: '#64748b', fontSize: '16px' }}>Så fint å se deg her.</p>)}

            <div style={{ marginTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, background: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284c7' }}><Star size={20} fill="#0284c7" /> <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Denne måneden</span></div>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', lineHeight: '1.4' }}><span style={{ fontSize: '32px', fontWeight: '900' }}>{stats.denneMnd}</span> aktiviteter</p>
                    <p style={{ fontSize: '14px', color: '#0369a1', marginTop: '4px' }}>Godt jobba! 👏</p>
                </div>
                <div style={{ flex: 1, background: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#059669' }}><Coins size={20} /> <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Penger brukt</span></div>
                    <p style={{ fontSize: '32px', fontWeight: '900', color: '#064e3b' }}>{stats.totalKostnad},-</p>
                </div>
            </div>
          </div>
        </div>

        {/* PÅRØRENDE LOGIKK */}
        <div style={{ marginBottom: '40px' }}>
            {profil?.rolle === 'senior' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={20} className="fill-orange-500 text-orange-500"/> Pårørende-kobling</h3>
                            <p style={{ color: '#b45309', fontSize: '14px', marginTop: '4px' }}>Gi denne koden til dine pårørende så de kan følge med:</p>
                        </div>
                        <div style={{ background: 'white', padding: '12px 24px', borderRadius: '12px', border: '2px dashed #f59e0b', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', color: '#451a03' }}>{profil?.invite_code}</div>
                    </div>
                    {relasjoner.length > 0 && (
                        <div style={{ borderTop: '1px solid #fcd34d', paddingTop: '16px', marginTop: '8px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e', textTransform: 'uppercase', marginBottom: '12px' }}>Tilkoblede personer:</p>
                            {relasjoner.map(rel => (
                                <div key={rel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '12px', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 'bold', color: '#451a03' }}>{rel.full_name}</span>
                                    <button onClick={() => setUnlinkModal({ vis: true, id: rel.id, navn: rel.full_name, rolle: 'familie' })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Fjern</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* PÅRØRENDE - KOBLE TIL */}
            {profil?.rolle === 'familie' && (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>Personer du følger</h3>
                    
                    {relasjoner.length === 0 ? (
                         <div style={{background:'#f8fafc', padding:'20px', borderRadius:'16px', textAlign:'center'}}>
                             <p style={{ color: '#64748b', marginBottom:'16px' }}>Du følger ingen enda. Har du fått en kode?</p>
                             <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                <input value={connectCode} onChange={e=>setConnectCode(e.target.value)} placeholder="Skriv kode (f.eks. TUR-123)" style={{padding:'12px', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none', textTransform:'uppercase', textAlign:'center', width:'180px', fontWeight:'bold'}} />
                                <button onClick={handleConnect} style={{background:'#2563eb', color:'white', padding:'12px 20px', borderRadius:'8px', fontWeight:'bold', border:'none', cursor:'pointer'}}>Koble til</button>
                             </div>
                             {connectMsg && <p style={{marginTop:'12px', fontWeight:'bold', color:connectMsg.includes('Suksess') ? '#16a34a' : '#dc2626'}}>{connectMsg}</p>}
                         </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {relasjoner.map(rel => (
                                <div key={rel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '50%' }}><User size={20} color="#0284c7"/></div><div><p style={{ fontWeight: 'bold', color: '#0f172a' }}>{rel.full_name}</p><p style={{ fontSize: '12px', color: '#64748b' }}>Senior</p></div></div>
                                    <button onClick={() => setUnlinkModal({ vis: true, id: rel.id, navn: rel.full_name, rolle: 'senior' })} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #fee2e2', padding: '8px 16px', borderRadius: '99px', color: '#ef4444', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}><UserMinus size={14}/> Koble fra</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} className="text-blue-600"/> {profil?.rolle === 'familie' && relasjoner.length > 0 ? 'Deres planlagte aktiviteter' : 'Dine planlagte aktiviteter'}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {kommende.length === 0 && (<div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>Ingen kommende aktiviteter.</div>)}
            {kommende.map(a => (
              <Link href={`/aktivitet/${a.id}`} key={a.id} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>{a.tittel}</h4>
                    <p style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '16px', fontWeight: '500' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {a.dato}</span> <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> {a.sted}</span></p>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '50%' }}><ArrowRight size={20} color="#cbd5e1"/></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
