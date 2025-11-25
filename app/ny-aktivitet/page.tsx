'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import * as chrono from 'chrono-node';
import { MapPin, Calendar, Type, FileText, Users, Loader2, ArrowLeft, Clock, Coins } from 'lucide-react';

export default function NyAktivitetPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [tittel, setTittel] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [datoVal, setDatoVal] = useState('');
  const [tidVal, setTidVal] = useState('');
  
  // NYTT: Delt adresse
  const [adresse, setAdresse] = useState('');
  const [postnr, setPostnr] = useState('');
  const [poststed, setPoststed] = useState('');

  const [ingenBegrensning, setIngenBegrensning] = useState(false);
  const [antallPlasser, setAntallPlasser] = useState('4');
  const [pris, setPris] = useState('0');
  
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tolketDato, setTolketDato] = useState('');

  useEffect(() => {
    const sjekk = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      else setCheckingAuth(false);
    };
    sjekk();
  }, []);

  const lagreAktivitet = async () => {
    if (!tittel || !datoVal || !tidVal || !adresse) return alert('Du må fylle ut tittel, dato, klokkeslett og adresse.');
    setLoading(true);

    const d = new Date(datoVal);
    const datoStr = d.toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' });
    const finalString = `${datoStr.charAt(0).toUpperCase() + datoStr.slice(1)} kl ${tidVal}`;
    
    // Setter sammen fullt sted
    const fulltSted = `${adresse}, ${postnr} ${poststed}`;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('activities').insert({
        tittel, 
        beskrivelse, 
        dato: finalString,
        sted: fulltSted, // Lagrer sammensatt
        postnummer: postnr, // Lagrer postnr separat for filtering
        max_deltakere: ingenBegrensning ? null : parseInt(antallPlasser),
        price: parseInt(pris) || 0,
        creator_id: user.id
      });
      if (!error) { router.push('/'); router.refresh(); }
      else alert(error.message);
    }
    setLoading(false);
  };

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-400"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex justify-center items-start pt-10 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 font-bold text-xs uppercase tracking-wider">
          <ArrowLeft size={14} /> Avbryt
        </button>
        <h1 className="text-3xl font-black text-slate-900 mb-8">Ny Aktivitet</h1>
        
        <div className="space-y-8">
          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><Type size={16}/> Hva skal dere?</label>
            <input value={tittel} onChange={e => setTittel(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg outline-none focus:border-blue-400" placeholder="Navn på aktivitet" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><Calendar size={16}/> Dato</label>
              <input type="date" value={datoVal} onChange={e => setDatoVal(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 font-medium" />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-2
