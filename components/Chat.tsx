'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, Mic, Square, User } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  audio_url: string | null;
  user_id: string;
  full_name: string;
  created_at: string;
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
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user?.id || null);
    });

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase
      .channel('chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `activity_id=eq.${activityId}` }, (payload) => {
        setMessages((current) => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activityId]);

  useEffect(() => {
    bunnRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- LYD LOGIKK ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Kunne ikke starte mikrofonen.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `${Date.now()}-tale.webm`;
    const { error: uploadError } = await supabase.storage.from('chat-audio').upload(fileName, audioBlob);
    if (uploadError) return alert('Feil ved opplasting');

    const { data: { publicUrl } } = supabase.storage.from('chat-audio').getPublicUrl(fileName);
    const { data: profil } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

    await supabase.from('messages').insert({
      content: '🎤 Talemelding',
      audio_url: publicUrl,
      activity_id: activityId,
      user_id: user.id,
      full_name: profil?.full_name || 'Ukjent'
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profil } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

    await supabase.from('messages').insert({
      content: newMessage,
      activity_id: activityId,
      user_id: user.id,
      full_name: profil?.full_name || 'Ukjent',
      audio_url: null
    });
    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px', backgroundColor: '#ffffff' }}>
      
      {/* HEADER */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white' }}>
        <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Deltaker-chat</h3>
      </div>

      {/* MELDINGER */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f8fafc' }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '20px' }}>Ingen meldinger enda. Si hei! 👋</p>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              
              {/* Navn (hvis det ikke er meg) */}
              {!isMe && (
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', marginLeft: '12px' }}>
                  {msg.full_name}
                </span>
              )}

              {/* Boblen */}
              <div style={{ 
                maxWidth: '80%', 
                padding: '12px 16px', 
                borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                backgroundColor: isMe ? '#2563eb' : 'white',
                color: isMe ? 'white' : '#1e293b',
                boxShadow: isMe ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                border: isMe ? 'none' : '1px solid #e2e8f0',
                fontSize: '15px',
                lineHeight: '1.5'
              }}>
                {msg.audio_url ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <span style={{ fontSize: '20px' }}>🎤</span>
                     <audio controls src={msg.audio_url} style={{ height: '32px', maxWidth: '200px' }} />
                  </div>
                ) : (
                  <p style={{ margin: 0 }}>{msg.content}</p>
                )}
              </div>

              {/* Tidspunkt */}
              <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', margin: '0 4px' }}>
                {formatTime(msg.created_at)}
              </span>
            </div>
          )
        })}
        <div ref={bunnRef} />
      </div>

      {/* INPUT FELT */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
        
        {/* Mikrofon Knapp */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stopp opptak" : "Start opptak"}
          style={{ 
            width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            backgroundColor: isRecording ? '#fee2e2' : '#f1f5f9',
            color: isRecording ? '#ef4444' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          {isRecording ? <Square size={20} fill="#ef4444" /> : <Mic size={20} />}
        </button>

        {/* Tekstfelt */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={isRecording ? "Tar opp lyd..." : "Skriv en melding..."}
          disabled={isRecording}
          style={{ 
            flex: 1, padding: '12px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', 
            fontSize: '15px', outline: 'none', backgroundColor: isRecording ? '#f8fafc' : 'white',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
        
        {/* Send Knapp */}
        <button 
          onClick={sendMessage}
          disabled={isRecording || !newMessage.trim()}
          style={{ 
            width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            backgroundColor: newMessage.trim() ? '#2563eb' : '#f1f5f9',
            color: newMessage.trim() ? 'white' : '#cbd5e1',
            transition: 'all 0.2s',
            pointerEvents: newMessage.trim() ? 'auto' : 'none'
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}