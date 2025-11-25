'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, ArrowRight, ArrowLeft, User, Heart, UserMinus, Star, Trophy, Coins, Edit2, Save } from 'lucide-react';

export default function MinSide() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', postnummer: '' });
  const [kommende, setKommende] = useState<any[]>([]);
  const [stats, setStats] = useState({ denneMnd: 0, totalt: 0, totalKostnad: 0 });
  const [relasjoner, setRelasjoner] = useState<any[]>([]);
  const [unlinkModal, setUnlinkModal] = useState<{ vis: boolean, id: string, navn: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectCode, setConnectCode] = useState('');
  const [connectMsg, setConnectMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfil(prof);
      setEditForm({ full_name: prof.full_name || '', address: prof.address || '', postnummer: prof.postnummer || '' });

      // Hent relasjoner (universelt: Alle jeg er koblet til)
      // Vi sjekker både om jeg er 'senior' (de som følger meg) og 'relative' (de jeg følger)
      const { data: followers } = await supabase.from('family_links').select('relative_id').eq('senior_id', user.id);
      const { data: following } = await supabase.from('family_links').select('senior_id').eq('relative_id', user.id);
      
      let connectionIds: string[] = [];
      if (followers) connectionIds = [...connectionIds, ...followers.map(f => f.relative_id)];
      if (following) connectionIds = [...connectionIds, ...following.map(f => f.senior_id)];
      
      if (connectionIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('*').in('id', connectionIds);
          setRelasjoner(profiles || []);
      }

      // Hent aktiviteter (Dine egne)
      const { data: paameldinger } = await supabase.from('participants').select('activity_id').eq('user_id', user.id);
      if (paameldinger) {
        const ids = paameldinger.map(p => p.activity_id);
        const { data: akts } = await supabase.from('activities').select('*').in('id', ids).order('created_at', { ascending: false });
        if (akts) {
          setKommende(akts);
          setStats({ totalt: akts.length, denneMnd: Math.min(akts.length, 3), totalKostnad: akts.reduce((s, a) => s + (a.price || 0), 0) });
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update(editForm).eq('id', user.id);
    if (!error) { setProfil({ ...profil, ...editForm }); setIsEditing(false); }
  };

  const handleConnect = async () => {
    if (!connectCode) return;
    const { data: target } = await supabase.from('profiles').select('*').eq('invite_code', connectCode.toUpperCase()).single();
    if (!target) return setConnectMsg('Fant ingen med koden.');
    const { error } = await supabase.from('family_links').insert({ relative_id: user.id, senior_id: target.id });
    if (!error) { setConnectMsg('Suksess!'); window.location.reload(); } else setConnectMsg('Feil eller allerede koblet.');
  };

  const handleUnlink = async () => {
    if (!unlinkModal) return;
    await supabase.from('family_links').delete().eq('senior_id', unlinkModal.id).eq('relative_id', user.id); // Hvis jeg følger dem
    await supabase.from('family_links').delete().eq('relative_id', unlinkModal.id).eq('senior_id', user.id); // Hvis de følger meg
    setRelasjoner(prev => prev.filter(r => r.id !== unlinkModal.id));
    setUnlinkModal(null);
  };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      {unlinkModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '400px' }}>
            <h3 style={{ fontWeight: '900', marginBottom: '16px', fontSize: '20px' }}>Fjerne kobling?</h3>
            <p style={{ marginBottom: '24px' }}>Vil du fjerne koblingen til {unlinkModal.navn}?</p>
            <button onClick={handleUnlink} style={{ background: '#ef4444', color: 'white', padding: '12px', borderRadius: '12px', width: '100%', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginBottom: '8px' }}>Fjern</button>
            <button onClick={() => setUnlinkModal(null)} style={{ background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '12px', width: '100%', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Avbryt</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontWeight: 'bold' }}><ArrowLeft size={16}/> Tilbake</Link>
            <button onClick={() => {supabase.auth.signOut(); router.push('/')}} style={{ background: 'none', border: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', display: 'flex', gap: '8px' }}><LogOut size={16}/> Logg ut</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>Min Profil</h1>
             <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} style={{ background: isEditing ? '#10b981' : '#f1f5f9', color: isEditing ? 'white' : '#475569', padding: '8px 16px', borderRadius: '99px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px' }}>{isEditing ? <><Save size={16}/> Lagre</> : <><Edit2 size={16}/> Endre</>}</button>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
             <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>NAVN</label>{isEditing ? <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} /> : <p style={{ fontSize: '18px', fontWeight: '600' }}>{profil?.full_name}</p>}</div>
             <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>ADRESSE</label>{isEditing ? <input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} /> : <p style={{ fontSize: '18px', fontWeight: '600' }}>{profil?.address}</p>}</div>
             <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>POSTNR</label>{isEditing ? <input value={editForm.postnummer} onChange={e => setEditForm({...editForm, postnummer: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} /> : <p style={{ fontSize: '18px', fontWeight: '600' }}>{profil?.postnummer}</p>}</div>
          </div>
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#d97706', marginBottom: '8px' }}>DIN KODE FOR PÅRØRENDE</p>
                <div style={{ display: 'inline-block', background: '#fffbeb', color: '#b45309', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', padding: '12px 24px', borderRadius: '12px', border: '2px dashed #fcd34d' }}>{profil?.invite_code}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Dine koblinger</h2>
            {relasjoner.length === 0 ? (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                    <p style={{ marginBottom: '12px', color: '#64748b' }}>Legg til en kode for å koble til en venn eller pårørende:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={connectCode} onChange={e => setConnectCode(e.target.value)} placeholder="KODE (f.eks. TUR-123)" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        <button onClick={handleConnect} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Koble til</button>
                    </div>
                    {connectMsg && <p style={{ marginTop: '8px', fontWeight: 'bold' }}>{connectMsg}</p>}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {relasjoner.map(rel => (
                        <div key={rel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '50%' }}><User size={20} color="#0284c7"/></div><span style={{ fontWeight: 'bold', color: '#0f172a' }}>{rel.full_name}</span></div>
                            <button onClick={() => setUnlinkModal({ vis: true, id: rel.id, navn: rel.full_name })} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #fee2e2', padding: '8px 16px', borderRadius: '99px', color: '#ef4444', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}><UserMinus size={14}/> Fjern</button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} className="text-blue-600"/> Dine aktiviteter</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {kommende.map(a => (
              <Link href={`/aktivitet/${a.id}`} key={a.id} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>{a.tittel}</h4>
                    <p style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '16px', fontWeight: '500' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {a.dato}</span> 
                    </p>
                  </div>
                  <ArrowRight size={20} color="#cbd5e1"/>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
