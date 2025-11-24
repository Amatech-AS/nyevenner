'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, ArrowRight, History, ArrowLeft, User, Heart, UserMinus, MapPin, Phone, Edit2, Save, X, Star, Trophy, Coins } from 'lucide-react';

export default function MinSide() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  
  // Redigering av profil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', postnummer: '', telefon: '' });
  
  const [kommende, setKommende] = useState<any[]>([]);
  const [historikk, setHistorikk] = useState<any[]>([]);
  const [stats, setStats] = useState({ denneMnd: 0, totalt: 0, totalKostnad: 0 });
  const [relasjoner, setRelasjoner] = useState<any[]>([]); // Liste over de man er koblet til
  
  const [visHistorikk, setVisHistorikk] = useState(false);
  const [unlinkModal, setUnlinkModal] = useState<{ vis: boolean, id: string, navn: string } | null>(null);
  const [loading, setLoading] = useState(true);

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
        telefon: prof.telefon || '' 
      });

      let targetUserId = user.id;
      
      // Hent relasjoner (Både for senior og pårørende)
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
           if (rels && rels.length > 0) targetUserId = rels[0].id; // Vis statistikk for senior
        }
      }

      // Hent aktiviteter
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
    } else {
        alert('Kunne ikke lagre: ' + error.message);
    }
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
      
      {/* Unlink Modal */}
      {unlinkModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Fjerne kobling?</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Vil du fjerne koblingen til <strong>{unlinkModal.navn}</strong>?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleUnlink} style={{ flex: 1, padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Ja, fjern</button>
              <button onClick={() => setUnlinkModal(null)} style={{ flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontWeight: 'bold', fontSize: '14px' }}>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '50%' }}><ArrowLeft size={16}/></div> Tilbake
            </Link>
            <button onClick={loggUt} style={{ border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', display: 'flex', gap: '8px', fontSize: '14px' }}><LogOut size={16}/> Logg ut</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* PROFILKORT (REDIGERBART) */}
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
             <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Navn</label>
                {isEditing ? (
                    <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
                ) : (
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>{profil?.full_name}</p>
                )}
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Adresse</label>
                    {isEditing ? (
                        <input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Gateadresse" />
                    ) : (
                        <p style={{ fontSize: '18px', fontWeight: '500', color: '#334155' }}>{profil?.address || 'Ingen adresse registrert'}</p>
                    )}
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Postnr</label>
                    {isEditing ? (
                        <input value={editForm.postnummer} onChange={e => setEditForm({...editForm, postnummer: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
                    ) : (
                        <p style={{ fontSize: '18px', fontWeight: '500', color: '#334155' }}>{profil?.postnummer}</p>
                    )}
                </div>
             </div>
          </div>

          {/* PÅRØRENDE KODE (Kun for senior) */}
          {profil?.rolle === 'senior' && (
             <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d97706', marginBottom: '8px' }}>Din kode for pårørende</p>
                <div style={{ display: 'inline-block', background: '#fffbeb', color: '#b45309', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', padding: '12px 24px', borderRadius: '12px', border: '2px dashed #fcd34d' }}>
                    {profil?.invite_code}
                </div>
             </div>
          )}
        </div>

        {/* RELASJONER */}
        {relasjoner.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>
                    {profil?.rolle === 'familie' ? 'Du følger:' : 'Dine pårørende:'}
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
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
                                <button onClick={() => setUnlinkModal({ vis: true, id: rel.id, navn: rel.full_name })} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Fjern</button>
                            </div>
                            {/* Hvis jeg er pårørende, vis statistikk for denne senioren */}
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

        {/* AKTIVITETER LISTE */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={24} className="text-blue-600"/> 
            {profil?.rolle === 'familie' && relasjoner.length > 0 ? 'Deres planlagte aktiviteter' : 'Dine planlagte aktiviteter'}
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {kommende.length === 0 && (<div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>Ingen kommende aktiviteter.</div>)}
            {kommende.map(a => (
              <Link href={`/aktivitet/${a.id}`} key={a.id} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>{a.tittel}</h4>
                    <p style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '16px', fontWeight: '500' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {a.dato}</span> 
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> {a.sted}</span>
                    </p>
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