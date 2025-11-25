'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, Calendar, Type, FileText, Users, Loader2, ArrowLeft, Clock, Info } from 'lucide-react';

export default function RedigerAktivitetPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();
  
  const [tittel, setTittel] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [datoVal, setDatoVal] = useState('');
  const [tidVal, setTidVal] = useState('');
  const [stedInput, setStedInput] = useState('');
  const [ingenBegrensning, setIngenBegrensning] = useState(false);
  const [antallPlasser, setAntallPlasser] = useState('4');
  const [loading, setLoading] = useState(true);
  
  // Lagrer original dato for visning
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data } = await supabase.from('activities').select('*').eq('id', id).single();
      if (data) {
        if (data.creator_id !== user.id) {
          alert('Du kan bare redigere dine egne aktiviteter');
          return router.push('/');
        }
        setTittel(data.tittel);
        setBeskrivelse(data.beskrivelse);
        setStedInput(data.sted);
        setIngenBegrensning(data.max_deltakere === null);
        setAntallPlasser(data.max_deltakere ? String(data.max_deltakere) : '4');
        setCurrentDateStr(data.dato); // Vis dette til brukeren
      }
      setLoading(false);
    };
    load();
  }, []);

  const lagreEndringer = async () => {
    setLoading(true);
    
    let finalDatoString = undefined;
    if (datoVal && tidVal) {
        const d = new Date(datoVal);
        const datoStr = d.toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' });
        finalDatoString = `${datoStr.charAt(0).toUpperCase() + datoStr.slice(1)} kl ${tidVal}`;
    }

    const updateData: any = {
      tittel,
      beskrivelse,
      sted: stedInput,
      max_deltakere: ingenBegrensning ? null : parseInt(antallPlasser)
    };

    if (finalDatoString) updateData.dato = finalDatoString;

    const { error } = await supabase.from('activities').update(updateData).eq('id', id);

    if (!error) {
      router.push(`/aktivitet/${id}`);
      router.refresh();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex justify-center items-start pt-10 font-sans text-slate-900">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 font-bold text-xs uppercase">
          <ArrowLeft size={14} /> Avbryt
        </button>
        <h1 className="text-3xl font-black text-slate-900 mb-8">Rediger aktivitet</h1>
        
        <div className="space-y-6">
          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2"><Type size={18}/> Tittel</label>
            <input value={tittel} onChange={e => setTittel(e.target.value)} className="w-full p-3 border rounded-xl" />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold"><Clock size={16}/> Nåværende tidspunkt:</div>
            <div className="text-lg">{currentDateStr}</div>
            <div className="text-xs opacity-75 mt-1">Fyll ut feltene under KUN hvis du vil endre tidspunktet.</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 mb-2 block flex gap-2"><Calendar size={18}/> Ny dato?</label>
              <input type="date" value={datoVal} onChange={e => setDatoVal(e.target.value)} className="w-full p-3 border rounded-xl" />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-2 block flex gap-2"><Clock size={18}/> Ny tid?</label>
              <input type="time" value={tidVal} onChange={e => setTidVal(e.target.value)} className="w-full p-3 border rounded-xl" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2"><MapPin size={18}/> Hvor?</label>
            <input value={stedInput} onChange={e => setStedInput(e.target.value)} className="w-full p-3 border rounded-xl" />
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-bold text-slate-700 flex items-center gap-2"><Users size={18}/> Antall plasser:</span>
              <input type="number" value={antallPlasser} onChange={e => setAntallPlasser(e.target.value)} disabled={ingenBegrensning} className="w-20 p-2 border rounded-lg text-center font-bold bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={ingenBegrensning} onChange={e => setIngenBegrensning(e.target.checked)} className="w-4 h-4" />
              <label className="text-sm font-medium">Ubegrenset antall</label>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-2 block flex gap-2"><FileText size={18}/> Beskrivelse</label>
            <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={4} className="w-full p-3 border rounded-xl" />
          </div>

          <button onClick={lagreEndringer} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700">
            Lagre endringer
          </button>
        </div>
      </div>
    </div>
  );
}