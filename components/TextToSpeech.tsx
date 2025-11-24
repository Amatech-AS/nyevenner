'use client';

import { useState, useEffect } from 'react';
import { Volume2, StopCircle } from 'lucide-react';

export default function TextToSpeech({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const handleSpeak = () => {
    if (!supported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Stopp eventuell annen prating først
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'no-NO'; // Norsk språk
      utterance.rate = 0.9; // Litt roligere tempo for eldre
      
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stopp prating hvis man forlater siden
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  return (
    <button 
      onClick={handleSpeak}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        backgroundColor: isSpeaking ? '#fee2e2' : '#f0f9ff',
        color: isSpeaking ? '#ef4444' : '#0284c7',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '99px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '16px'
      }}
    >
      {isSpeaking ? (
        <><StopCircle size={18} /> Stopp opplesing</>
      ) : (
        <><Volume2 size={18} /> Les opp beskrivelsen</>
      )}
    </button>
  );
}