'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Chat from '@/components/Chat';
import LoginModal from '@/components/LoginModal';
import Weather from '@/components/Weather';
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Loader2, Info, Edit2, Trash2, Navigation } from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div style={{height:'200px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>Laster kart...</div> 
});

type AktivitetType = { 
  id: string; 
  tittel: string; 
  beskrivelse: string; 
  dato: string; 
  sted: string; 
  postnummer: string;
  max_deltakere: number | null; 
  image_url: string | null;
  price: number;
  creator_id: string;
}

// (Beholder bildevelgeren for sikkerhets skyld)
const imageCollections = { default: ['https://images.unsplash.com/photo-1523301343968-63214359d56b?q=80&w=400'] };
const getSmartImage = (t: any, i: any) => imageCollections.default[0];

export default function AktivitetDetalj() {
  const supabase = createClient();
  const { id } = useParams();
  const router = useRouter();
  const [aktivitet, setAktivitet] = useState<AktivitetType | null>(null);
  const [erPaameldt, setErPaameldt] = useState(false);
  const [antall, setAntall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      setCurrentUser(userRes.user);
      const { data: akt } = await supabase.from('activities').select('*').eq('id', id).single();
      if (akt) setAktivitet(akt);
      const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('activity_id', id);
      if (count !== null) setAntall(count);
      if (userRes.user && id) {
        const { data: sjekk } = await supabase.from('participants').select('*').eq('activity_id', id).eq('user_id', userRes.user
