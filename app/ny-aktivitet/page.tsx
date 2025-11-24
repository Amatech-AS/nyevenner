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
  const [stedInput, setStedInput] = useState('');
  const [ingenBegrensning, setIngenBegrensning] = useState(false);
  const [antallPlasser, setAntallPlasser] = useState('4');
  
  // NYTT: Pris
  const [pris, setPris] = useState('0');

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const sjekk = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      else setCheckingAuth(false);
    };
    sjekk();
  }, []);

  const lagreAktivitet = async () => {
    if (!tittel || !datoVal || !tidVal || !stedInput) return alert('Du må fylle ut tittel, dato, klokkeslett og sted.');
    setLoading(true);

    const d = new Date(datoVal);
    const datoStr = d.toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' });
    const finalString = `${datoStr.charAt(0).toUpperCase() + datoStr.slice(1)} kl ${tidVal}`;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('activities').insert({
        tittel, 
        beskrivelse, 
        dato: finalString,
        sted: stedInput, 
        max_deltakere: ingenBegrensning ? null : parseInt(antallPlasser),
        price: parseInt(pris) || 0, // Lagrer prisen
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
          {/* TITTEL */}
          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><Type size={16}/> Hva skal dere?</label>
            <input value={tittel} onChange={e => setTittel(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg outline-none focus:border-blue-400" placeholder="Navn på aktivitet" />
          </div>

          {/* DATO & TID */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><Calendar size={16}/> Dato</label>
              <input type="date" value={datoVal} onChange={e => setDatoVal(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 font-medium" />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><Clock size={16}/> Klokkeslett</label>
              <input type="time" value={tidVal} onChange={e => setTidVal(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 font-medium" />
            </div>
          </div>

          {/* PRIS (NYTT!) */}
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
             <label className="font-bold text-emerald-800 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><Coins size={16}/> Koster det noe?</label>
             <p className="text-emerald-700 text-sm mb-3">Skriv 0 hvis det er gratis. Hvis det koster penger (f.eks. kinobillett, mat), skriv summen per person.</p>
             <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={pris} 
                  onChange={e => setPris(e.target.value)} 
                  className="w-32 p-3 border-2 border-emerald-200 rounded-lg text-xl font-bold text-center outline-none focus:border-emerald-500" 
                />
                <span className="font-bold text-emerald-800">NOK</span>
             </div>
          </div>

          {/* STED */}
          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><MapPin size={16}/> Hvor?</label>
            <input value={stedInput} onChange={e => setStedInput(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400" placeholder="Møtested" />
          </div>

          {/* PLASSER */}
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg border border-blue-100 w-fit">
              <span className="font-bold text-blue-900 flex items-center gap-2"><Users size={18}/> Antall plasser:</span>
              <input 
                type="number" 
                value={antallPlasser} 
                onChange={e => setAntallPlasser(e.target.value)} 
                disabled={ingenBegrensning}
                className="w-20 p-2 border-2 border-blue-200 rounded-lg text-center font-bold text-xl disabled:opacity-50" 
              />
            </div>
            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" checked={ingenBegrensning} onChange={e => setIngenBegrensning(e.target.checked)} className="w-5 h-5 text-blue-600 rounded cursor-pointer" />
              <label className="text-sm text-slate-600 font-medium cursor-pointer" onClick={() => setIngenBegrensning(!ingenBegrensning)}>Sett til ubegrenset (Alle får plass)</label>
            </div>
          </div>

          {/* BESKRIVELSE */}
          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2 text-sm uppercase tracking-wide"><FileText size={16}/> Beskrivelse</label>
            <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400" placeholder="Skriv litt om hva dere skal gjøre..." />
          </div>

          <button onClick={lagreAktivitet} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.01]">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Publiser Aktivitet'}
          </button>
        </div>
      </div>
    </div>
  )
}