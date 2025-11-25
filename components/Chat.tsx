'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, Mic, Square } from 'lucide-react';

type Message = {
  id: string; content: string; audio_url: string | null; user_id: string; full_name: string; created_at: string;
}

export default function Chat({ activityId }: { activityId: string }) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const bunnRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user?.id || null));
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('activity_id', activityId).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
    const channel = supabase.channel('chat_room').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `activity_id=eq.${activityId}` }, (payload) => {
      setMessages((current) => [...current, payload.new as Message]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activityId]);

  useEffect(() => { bunnRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Lyd-logikk (forkortet for oversikt)
  const startRecording = async () => { /* ...samme som før... */ };
  const stopRecording = () => { /* ...samme som før... */ };
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profil } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    await supabase.from('messages').insert({ content: newMessage, activity_id: activityId, user_id: user.id, full_name: profil?.full_name || 'Ukjent' });
    setNewMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px', maxHeight: '70vh', backgroundColor: '#ffffff' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: 'white' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Deltaker-chat</h3>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f8fafc' }}>
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', marginLeft: '12px' }}>{msg.full_name}</span>}
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', backgroundColor: isMe ? '#2563eb' : 'white', color: isMe ? 'white' : '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '15px' }}>
                <p style={{ margin: 0 }}>{msg.content}</p>
              </div>
            </div>
          )
        })}
        <div ref={bunnRef} />
      </div>
      <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Skriv melding..." style={{ flex: 1, padding: '12px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none' }} />
        <button onClick={sendMessage} disabled={!newMessage.trim()} style={{ padding: '12px', borderRadius: '50%', border: 'none', backgroundColor: '#2563eb', color: 'white' }}><Send size={20} /></button>
      </div>
    </div>
  )
}
