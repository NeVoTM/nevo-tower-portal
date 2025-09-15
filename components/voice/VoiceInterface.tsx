'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  isListening?: boolean;
  selectedLanguage?: string;
}

// Supported languages for global markets
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' }
];

export default function VoiceInterface({ onTranscript, isListening = false, selectedLanguage = 'en-US' }: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(selectedLanguage);
  const [showLanguages, setShowLanguages] = useState(false);
  const [autoDetect, setAutoDetect] = useState(false);
  const [lastTranscriptTime, setLastTranscriptTime] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLang;
      
      // Handle speech recognition results
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Speech result:', transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          handleTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLang]);

  // Debounced transcript handler to prevent rapid repeated calls
  const handleTranscript = (transcript: string) => {
    const now = Date.now();
    
    // Debounce: only process if it's been at least 1.5 seconds since last transcript
    if (now - lastTranscriptTime < 1500) {
      console.log('Debouncing transcript:', transcript);
      return;
    }
    
    const cleanTranscript = transcript.trim();
    
    // Only process meaningful transcripts
    if (cleanTranscript.length < 3) return;
    
    setLastTranscriptTime(now);
    onTranscript(cleanTranscript);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const getGreeting = (langCode: string) => {
    const phrases: { [key: string]: string } = {
      'en-US': 'Hello! I\'m your DMM AI Assistant. How can I help you today?',
      'en-GB': 'Hello! I\'m your DMM AI Assistant. How may I assist you today?',
      'es-ES': '¡Hola! Soy tu Asistente de IA DMM. ¿Cómo puedo ayudarte hoy?',
      'es-MX': '¡Hola! Soy tu Asistente de IA DMM. ¿En qué puedo ayudarte hoy?',
      'fr-FR': 'Bonjour! Je suis votre Assistant IA DMM. Comment puis-je vous aider aujourd\'hui?',
      'de-DE': 'Hallo! Ich bin Ihr DMM KI-Assistent. Wie kann ich Ihnen heute helfen?',
      'it-IT': 'Ciao! Sono il tuo Assistente IA DMM. Come posso aiutarti oggi?',
      'pt-BR': 'Olá! Eu sou seu Assistente de IA DMM. Como posso ajudá-lo hoje?',
      'zh-CN': '你好！我是您的DMM AI助手。今天我可以如何帮助您？',
      'ja-JP': 'こんにちは！私はあなたのDMM AIアシスタントです。今日はどのようにお手伝いできますか？',
      'ko-KR': '안녕하세요! 저는 당신의 DMM AI 어시스턴트입니다. 오늘 어떻게 도와드릴까요?',
      'ar-SA': 'مرحبا! أنا مساعد الذكي الاصطناعي DMM الخاص بك. كيف يمكنني مساعدتك اليوم؟',
      'hi-IN': 'नमस्ते! मैं आपका DMM AI सहायक हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?',
      'ru-RU': 'Привет! Я ваш DMM ИИ-помощник. Как я могу помочь вам сегодня?',
      'tr-TR': 'Merhaba! Ben sizin DMM AI Asistanınızım. Bugün size nasıl yardımcı olabilirim?',
      'nl-NL': 'Hallo! Ik ben je DMM AI Assistent. Hoe kan ik je vandaag helpen?',
      'sv-SE': 'Hej! Jag är din DMM AI-assistent. Hur kan jag hjälpa dig idag?'
    };
    
    return phrases[langCode] || phrases['en-US'];
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-gray-600 p-4 mb-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Volume2 className="h-5 w-5" />
        Multi-Language Voice Interface
      </h3>
      
      {/* Language Selection */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-200 transition-all duration-200"
          >
            <Globe className="h-4 w-4" />
            {currentLanguage?.flag} {currentLanguage?.name}
          </button>
          
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
              className="rounded"
            />
            Auto-detect language
          </label>
        </div>
        
        {showLanguages && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-white/5 rounded-lg max-h-40 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setShowLanguages(false);
                }}
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm transition-all duration-200 ${
                  selectedLang === lang.code
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-4">
        {/* Recording Button */}
        <button
          onClick={toggleRecording}
          disabled={isListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {/* Text-to-Speech Controls */}
        <button
          onClick={() => speak(getGreeting(selectedLang))}
          disabled={isSpeaking}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
        >
          <Volume2 className="h-4 w-4" />
          Test Voice
        </button>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            <VolumeX className="h-4 w-4" />
            Stop
          </button>
        )}
      </div>

      {/* Status Indicators */}
      <div className="mt-3 text-sm text-gray-400">
        {isRecording && (
          <div className="flex items-center gap-2 text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Recording in {currentLanguage?.name}...
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Speaking...
          </div>
        )}
        {!isRecording && !isSpeaking && (
          <div className="text-gray-500">
            Ready - Click "Start Recording" to begin voice input
          </div>
        )}
      </div>
    </div>
  );
}