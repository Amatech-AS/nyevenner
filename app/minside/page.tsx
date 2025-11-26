'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, ArrowRight, History, ArrowLeft, User, Heart, UserMinus, X, AlertTriangle, Trophy, Star, MapPin, Coins, Edit2, Save } from 'lucide-react';

export default function MinSide() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', postnummer: '' });
  const [kommende, setKommende] = useState<any[]>([]);
  const [historikk, setHistorikk] = useState<any[]>([]);
  const [stats, setStats] = useState({ denneMnd: 0, totalt: 0, totalKostnad: 0 });
  const [relasjoner, setRelasjoner] = useState<any[]>([]);
  const [visHistorikk, setVisHistorikk] = useState(false);
  const [unlinkModal, setUnlinkModal] = useState<{ vis: boolean, id: string, navn: string, rolle: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfil(prof);
      setEditForm({ full_name: prof.full_name || '', address: prof.address || '', postnummer: prof.postnummer || '' });
      
      let targetUserId = user.id;
      if (prof.rolle === 'senior') {
        const { data: links } = await supabase.from('family_links').select('relative_id').eq('senior_id', user.id);
        if (links) setRelasjoner(await supabase.from('profiles').select('*').in('id', links.map(l => l.relative_id)).then(res => res.data || []));
      } else if (prof.rolle === 'familie') {
        const { data: links } = await supabase.from('family_links').select('senior_id').eq('relative_id', user.id);
        if (links) {
           const rels = await supabase.from('profiles').select('*').in('id', links.map(l => l.senior_id)).then(res => res.data || []);
           setRelasjoner(rels);
           if (rels.length > 0) targetUserId = rels[0].id;
        }
      }

      const { data: paameldinger } = await supabase.from('participants').select('activity_id').eq('user_id', targetUserId);
      if (paameldinger) {
        const ids = paameldinger.map(p => p.activity_id);
        const { data: akts } = await supabase.from('activities').select('*').in('id', ids).order('created_at', { ascending: false });
        if (akts) {
          setKommende(akts.slice(0, 3));
          setHistorikk(akts.slice(3));
          setStats({ totalt: akts.length, denneMnd: Math.min(akts.length, 3), totalKostnad: akts.reduce((sum, a) => sum + (a.price || 0), 0) });
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update(editForm).eq('id', user.id);
    if (!error) { setProfil({ ...profil, ...editForm }); setIsEditing(false); } 
    else alert('Feil');
  };

  const handleUnlink = async () => {
    if (!unlinkModal) return;
    if (profil.rolle === 'familie') await supabase.from('family_links').delete().eq('relative_id', user.id).eq('senior_id', unlinkModal.id);
    else await supabase.from('family_links').delete().eq('senior_id', user.id).eq('relative_id', unlinkModal.id);
    setRelasjoner(prev => prev.filter(r => r.id !== unlinkModal.id));
    setUnlinkModal(null);
  };

  const loggUt = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif' }}>
      {/* ... Unlink modal (samme som før) ... */}
      
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontWeight: 'bold', fontSize: '14px' }}><ArrowLeft size={16}/> Tilbake</Link>
            <button onClick={loggUt} style={{ border: 'none', background: 'none', fontWeight: 'bold', color: '#64748b', cursor: 'pointer', display: 'flex', gap: '8px', fontSize: '14px' }}><LogOut size={16}/> Logg ut</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* PROFIL */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
             <div><h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>Min Profil</h1></div>
             <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isEditing ? '#10b981' : '#f1f5f9', color: isEditing ? 'white' : '#475569', padding: '10px 20px', borderRadius: '99px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{isEditing ? <><Save size={16}/> Lagre</> : <><Edit2 size={16}/> Endre</>}</button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
             <div><label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Navn</label>
                {isEditing ? (<input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} />) : (<p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>{profil?.full_name}</p>)}
             </div>
             
             <div><label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Adresse</label>
                {isEditing ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Gate" />
                        <input value={editForm.postnummer} onChange={e => setEditForm({...editForm, postnummer: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px' }} placeholder="Postnr" />
                    </div>
                ) : (
                    <p style={{ fontSize: '18px', fontWeight: '500', color: '#334155', display:'flex', alignItems:'center', gap:'8px' }}><MapPin size={18} className="text-slate-400"/> {profil?.address || ''} {profil?.postnummer ? `, ${profil.postnummer}` : '(Ingen adresse)'}</p>
                )}
             </div>
          </div>
          
          {profil?.rolle === 'senior' && (<div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}><p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d97706', marginBottom: '8px' }}>Pårørende-kode</p><div style={{ display: 'inline-block', background: '#fffbeb', color: '#b45309', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', padding: '12px 24px', borderRadius: '12px', border: '2px dashed #fcd34d' }}>{profil?.invite_code}</div></div>)}
        </div>

        {/* STATISTIKK */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom:'40px' }}>
            <div style={{ flex: 1, background: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284c7' }}><Star size={20} fill="#0284c7" /> <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>I år</span></div>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#0c4a6e' }}>{stats.totalt}</p>
            </div>
            <div style={{ flex: 1, background: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#059669' }}><Coins size={20} /> <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Brukt (NOK)</span></div>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#064e3b' }}>{stats.totalKostnad},-</p>
            </div>
        </div>

        {/* AKTIVITETER LISTE */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} className="text-blue-600"/> {profil?.rolle === 'familie' ? 'Deres planlagte aktiviteter' : 'Dine planlagte aktiviteter'}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
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