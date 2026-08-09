import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const COMMANDS = [
  { patterns: ['late', 'overdue', 'who is late'],   hint: '"show late orders"' },
  { patterns: ['today', 'today orders'],             hint: '"today orders"' },
  { patterns: ['pickup', 'pickups'],                 hint: '"show pickups"' },
  { patterns: ['all orders', 'reset', 'show all'],   hint: '"show all orders"' },
  { patterns: ['products', 'product list'],          hint: '"show products"' },
  { patterns: ['report', 'reports', 'revenue'],      hint: '"show report"' },
  { patterns: ['settings', 'config'],                hint: '"open settings"' },
];

export default function VoiceCommandPanel({ onCommand, triggerNotification }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported] = useState(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!supported) {
      triggerNotification('Voice commands require Chrome browser', 'info');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript.toLowerCase();
      setTranscript(heard);
      triggerNotification(`🎙️ Heard: "${heard}"`, 'info');
      processCommand(heard);
    };

    recognition.onerror = () => {
      setListening(false);
      triggerNotification('Voice not recognized. Try again.', 'info');
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const processCommand = (heard) => {
    for (const cmd of COMMANDS) {
      if (cmd.patterns.some(p => heard.includes(p))) {
        onCommand(heard);
        return;
      }
    }
    triggerNotification(`🤔 Not understood. Try: ${COMMANDS[0].hint}`, 'info');
  };

  if (!supported) return null;

  return (
    <div className="fixed bottom-24 left-6 z-50">
      <div className="relative">
        {/* Tooltip with hints */}
        {listening && (
          <div className="absolute bottom-full mb-3 left-0 w-52 glass-premium rounded-xl border border-accent-violet/30 p-3 animate-fade-in shadow-glow-violet">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="h-3.5 w-3.5 text-accent-violet animate-pulse" />
              <span className="text-[10px] font-bold text-accent-violet uppercase tracking-wider">Listening…</span>
            </div>
            <div className="space-y-1 text-[10px] text-gray-400">
              <p>Try saying:</p>
              <p className="text-white font-medium">"Show late orders"</p>
              <p className="text-white font-medium">"Show products"</p>
              <p className="text-white font-medium">"Open reports"</p>
            </div>
            {transcript && (
              <div className="mt-2 pt-2 border-t border-[#1C2438]">
                <p className="text-[10px] text-accent-teal">Heard: "{transcript}"</p>
              </div>
            )}
          </div>
        )}

        {/* Mic button */}
        <button
          onClick={listening ? stopListening : startListening}
          className={`relative h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
            listening
              ? 'bg-accent-violet shadow-glow-violet scale-110'
              : 'bg-[#111827] border border-[#1C2438] text-gray-400 hover:border-accent-violet/40 hover:text-accent-violet'
          }`}
          aria-label={listening ? 'Stop voice command' : 'Start voice command'}
        >
          {listening ? (
            <>
              <MicOff className="h-5 w-5 text-white" />
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-2xl border-2 border-accent-violet/50 animate-ping" />
              <div className="absolute inset-[-4px] rounded-[18px] border border-accent-violet/25 animate-pulse" />
            </>
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
