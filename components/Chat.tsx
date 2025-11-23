'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

type Message = {
  id: string
  content: string
  audio_url: string | null
  user_id: string
  full_name: string
  created_at: string
}

export default function Chat({ activityId }: { activityId: string }) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  
  const bunnRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [mimeType, setMimeType] = useState<string>('audio/webm') // Standard

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user?.id || null)
    })

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }
    fetchMessages()

    const channel = supabase
      .channel('chat_room')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `activity_id=eq.${activityId}`
      }, (payload) => {
        setMessages((current) => [...current, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activityId])

  useEffect(() => {
    bunnRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // --- FUNKSJONER FOR LYDOPPTAK ---

  // Hjelpefunksjon for å finne riktig format for mobilen
  const getSupportedMimeType = () => {
    const types = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg'
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return '' // Fallback
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const supportedType = getSupportedMimeType()
      setMimeType(supportedType) // Husk hvilken type vi valgte

      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Bruk samme type når vi lager filen som da vi tok opp
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedType })
        await sendAudioMessage(audioBlob, supportedType)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      alert('Kunne ikke starte mikrofonen. Sjekk innstillinger.')
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const sendAudioMessage = async (audioBlob: Blob, type: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Bestem filendelse basert på typen
    const extension = type.includes('mp4') ? 'mp4' : 'webm'
    const fileName = `${Date.now()}-tale.${extension}`

    // 1. Last opp filen til Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('chat-audio')
      .upload(fileName, audioBlob, {
        contentType: type // Viktig for at mobilen skal skjønne formatet
      })

    if (uploadError) {
      alert('Kunne ikke laste opp lyd: ' + uploadError.message)
      return
    }

    // 2. Få tak i den offentlige linken
    const { data: { publicUrl } } = supabase.storage
      .from('chat-audio')
      .getPublicUrl(fileName)

    // 3. Lagre meldingen i databasen
    const { data: profil } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    await supabase.from('messages').insert({
      content: '🎤 Sendte en talemelding',
      audio_url: publicUrl,
      activity_id: activityId,
      user_id: user.id,
      full_name: profil?.full_name || 'Ukjent'
    })
  }

  // --- VANLIG TEKSTMELDING ---

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profil } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    await supabase.from('messages').insert({
      content: newMessage,
      activity_id: activityId,
      user_id: user.id,
      full_name: profil?.full_name || 'Ukjent',
      audio_url: null
    })
    setNewMessage('')
  }

  return (
    <div className="mt-8 bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden flex flex-col h-[600px]">
      
      <div className="bg-blue-100 p-4 border-b border-blue-200">
        <h3 className="font-bold text-blue-900 text-lg">💬 Gruppe-chat</h3>
        <p className="text-sm text-blue-700">Her kan dere snakke sammen</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Ingen meldinger enda.</p>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-4 rounded-xl text-lg shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {!isMe && <p className="text-xs font-bold text-gray-500 mb-1">{msg.full_name}</p>}
                
                {msg.audio_url ? (
                  <div className="flex flex-col gap-2">
                     <p className="text-sm opacity-80">🎤 Talemelding</p>
                     <audio controls src={msg.audio_url} className="h-10 w-60 md:w-80" />
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bunnRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-4 rounded-full transition-all flex items-center justify-center shadow-md ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse scale-110' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={isRecording ? "Stopp opptak" : "Start opptak"}
        >
          {isRecording ? <span className="text-2xl">⏹️</span> : <span className="text-2xl">🎤</span>}
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={isRecording ? "Tar opp..." : "Skriv en melding..."}
          disabled={isRecording}
          className="flex-1 p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 outline-none disabled:bg-gray-100"
        />
        
        <button 
          onClick={sendMessage}
          disabled={isRecording}
          className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}