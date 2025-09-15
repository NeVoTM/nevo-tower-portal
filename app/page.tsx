'use client';

import React, { useState, useEffect } from 'react';
import { Copy, FileText, Image, ExternalLink, Sparkles, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import DMMChartsComponent from '../components/DMMChartsComponent';
import VoiceInterface from '../components/voice/VoiceInterface';

interface QueryResponse {
  answer: string;
  sources: string[];
  conversationId: string;
  suggestedFollowups?: string[];
  confidence: number;
  processingTime: number;
}

const DMMAgent = () => {
  const [selectedCity, setSelectedCity] = useState('miami');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string>('');
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);
  const [lastQueryTime, setLastQueryTime] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedResponse, setPaginatedResponse] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Pagination settings
  const WORDS_PER_PAGE = 200;
  
  // Split response into pages when it updates
  useEffect(() => {
    if (response) {
      const words = response.split(' ');
      const pages: string[] = [];
      
      for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
        const pageWords = words.slice(i, i + WORDS_PER_PAGE);
        pages.push(pageWords.join(' '));
      }
      
      setPaginatedResponse(pages);
      setCurrentPage(1);
    } else {
      setPaginatedResponse([]);
      setCurrentPage(1);
    }
  }, [response]);

  // Auto-speak AI responses - but not error messages
  useEffect(() => {
    if (response && !isLoading) {
      // Only auto-speak successful responses, not errors
      if (!response.toLowerCase().includes('sorry') || !response.toLowerCase().includes('error')) {
        speakResponse(response);
      }
    }
  }, [response, isLoading]);

  const nextPage = () => {
    if (currentPage < paginatedResponse.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= paginatedResponse.length) {
      setCurrentPage(pageNum);
    }
  };

  const cityData = {
    miami: {
      name: 'Miami NeVo Tower',
      description: '75-unit luxury development in North Bay Village',
      driveUrl: 'https://drive.google.com/drive/folders/17WSLrbUrB_wWjZkprNSwQcVxqLqZCA5p?usp=sharing',
      suggestions: [
        "Total project revenue?",
        "Show renderings",
        "Miami Makers Model?", 
        "Unit breakdown & pricing?",
        "Expected completion?",
        "Construction timeline?",
        "ROI projections?",
        "Market analysis?"
      ]
    },
    tonawanda: {
      name: 'Tonawanda Development',
      description: 'Western NY mixed-use development project',
      driveUrl: 'https://drive.google.com/drive/folders/1luH2MUmciMupSzOP9zGKyQ51GuZLcUrH?usp=sharing',
      suggestions: [
        "Rental rates vs market?",
        "WNY Makers Model?",
        "Development timeline?",
        "Project milestones?",
        "Compare to Miami?",
        "Legal framework?",
        "Partner structure?",
        "5 lots details?"
      ]
    }
  };

  // Smart correction function for misheard words
  const smartCorrectTranscript = (transcript: string, selectedCity: string) => {
    let corrected = transcript.toLowerCase();
    
    // Define project-specific corrections based on selected city
    const corrections = {
      miami: {
        // Common misheard words for Miami project
        'naval tower': 'nevo tower',
        'naval': 'nevo',
        'navel': 'nevo',
        'nevil': 'nevo',
        'neville': 'nevo',
        'makers model': 'makers model', // This one is correct
        'maker model': 'makers model',
        'making model': 'makers model'
      },
      tonawanda: {
        // Common misheard words for Tonawanda project
        'tona wanda': 'tonawanda',
        'tona-wanda': 'tonawanda',
        'tona vanda': 'tonawanda',
        'western new york': 'wny',
        'western ny': 'wny',
        'makers model': 'makers model'
      }
    };
    
    // Apply corrections for the selected city
    const cityCorrections = corrections[selectedCity as keyof typeof corrections] || {};
    
    Object.entries(cityCorrections).forEach(([wrong, right]) => {
      corrected = corrected.replace(new RegExp(wrong, 'gi'), right);
    });
    
    return corrected;
  };

  // Enhanced voice transcript handler with smart corrections and feedback prevention
  const handleVoiceTranscript = async (transcript: string) => {
    const rawTranscript = transcript.trim();
    
    // Apply smart corrections based on project context
    const correctedTranscript = smartCorrectTranscript(rawTranscript, selectedCity);
    
    console.log('🎤 Voice input received:', rawTranscript);
    if (rawTranscript.toLowerCase() !== correctedTranscript.toLowerCase()) {
      console.log('🎤 Auto-corrected to:', correctedTranscript);
    }
    
    // Prevent processing very short or empty transcripts
    if (correctedTranscript.length < 3) {
      console.log('🎤 Transcript too short, ignoring');
      return;
    }
    
    // Enhanced feedback loop prevention
    const aiPhrases = [
      'based on the context',
      'development project',
      'unfortunately',
      'refers to a unique approach',
      'key aspects',
      'community-driven',
      'i don\'t have',
      'specific information',
      'miami makers model refers to'
    ];
    
    const looksLikeAIResponse = aiPhrases.some(phrase => 
      correctedTranscript.toLowerCase().includes(phrase)
    );
    
    if (looksLikeAIResponse) {
      console.log('🎤 Detected AI feedback, ignoring transcript');
      return;
    }
    
    // Prevent duplicate calls when already loading
    if (isLoading) {
      console.log('🎤 Already processing, ignoring duplicate transcript');
      return;
    }
    
    // Stop any current speech before processing new input
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    console.log('🎤 Processing voice input:', correctedTranscript);
    
    setIsLoading(true);
    setQuery(correctedTranscript); // Show the corrected version in the input
    
    // Clear previous response
    setResponse('');
    setSources([]);

    try {
      console.log('🎤 Sending voice input to /api/claude...');
      
      // Add context about potential corrections to the AI prompt
      const enhancedQuery = rawTranscript !== correctedTranscript 
        ? `${correctedTranscript} (Note: User said "${rawTranscript}" but likely meant "${correctedTranscript}" based on project context)`
        : correctedTranscript;
      
      const requestBody = {
  query: enhancedQuery,
  city: selectedCity,
  context: conversationId ? {
    sessionId: conversationId,
    currentCity: selectedCity,
    messages: [],
    lastQueryTime: new Date(),
    relevantFiles: []
  } : undefined,
  includeContext: true
};

console.log('🎤 Selected city:', selectedCity);
console.log('🎤 Sending request body:', requestBody);

const res = await fetch('/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody),
});

      const voiceRes = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('🎤 Response status:', voiceRes.status);

if (!voiceRes.ok) {
  throw new Error(`HTTP error! status: ${voiceRes.status}`);
}

const data = await voiceRes.json();
      console.log('🎤 Voice response received:', data);
      
      // Check if the response indicates the AI doesn't know about something
      const responseText = data.answer || '';
      const indicatesUnknown = responseText.toLowerCase().includes("don't have") || 
                             responseText.toLowerCase().includes("unfortunately") ||
                             responseText.toLowerCase().includes("no information");
      setResponse(responseText);    
      setSources(data.sources || []);
      setLastQueryTime(data.processingTime);
      setConfidence(data.confidence);
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      if (data.suggestedFollowups?.length) {
        setSuggestedFollowups(data.suggestedFollowups);
      }

      console.log('🎤 Voice interaction completed successfully');
      
    } catch (error) {
      console.error('🎤 Voice processing error:', error);
      const errorMessage = 'Sorry, I had trouble processing your voice input. Please try again or type your message instead.';
      setResponse(errorMessage);
    } finally {
      setIsLoading(false);
      setQuery(''); // Clear after processing
    }
  };

  // Enhanced text-to-speech function with better controls
  // Enhanced speakResponse function with professional female voice
const speakResponse = (text: string) => {
  // Don't speak error messages to prevent feedback loops
  if (text.toLowerCase().includes('sorry') && text.toLowerCase().includes('error')) {
    console.log('🔊 Skipping speech for error message to prevent feedback');
    return;
  }
  
  if (window.speechSynthesis && text) {
    window.speechSynthesis.cancel();
    
    // Clean the text for better speech
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '') // Remove italics  
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links to text
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\d+\./g, '') // Remove numbered lists
      .substring(0, 500); // Increased limit for longer speech
    
    // Split into sentences and speak first few sentences only
    const sentences = cleanText.split('. ').slice(0, 3).join('. ');
    
    const utterance = new SpeechSynthesisUtterance(sentences);
    
    // Enhanced voice selection for professional female voice
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for US business female voices
    const preferredVoices = [
      'Microsoft Zira Desktop - English (United States)',
      'Microsoft Zira - English (United States)', 
      'Google US English Female',
      'Samantha',
      'Victoria',
      'Alex',
      'Allison'
    ];
    
    // Find the best available voice
    let selectedVoice = null;
    for (const preferred of preferredVoices) {
      selectedVoice = voices.find(voice => 
        voice.name.includes(preferred) || 
        (voice.name.toLowerCase().includes('female') && voice.lang.includes('en-US'))
      );
      if (selectedVoice) break;
    }
    
    // Fallback to any US English female voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.includes('en-US') && 
        (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira'))
      );
    }
    
    // Final fallback to any US English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.includes('en-US'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('🔊 Using voice:', selectedVoice.name);
    }
    
    // Professional voice settings
    utterance.rate = 0.85; // Slightly slower for professional clarity
    utterance.pitch = 1.1;  // Slightly higher for feminine tone
    utterance.volume = 0.75; // Clear but not overwhelming
    
    console.log('🔊 Speaking response:', sentences.substring(0, 100) + '...');
    
    utterance.onstart = () => {
      console.log('🔊 Speech started');
      setIsVoiceListening(false);
    };
    
    utterance.onend = () => {
      console.log('🔊 Speech ended');
      setTimeout(() => {
        console.log('🔊 Ready for next voice input');
      }, 1000);
    };
    
    utterance.onerror = (event) => {
      console.error('🔊 Speech error:', event.error);
    };
    
    window.speechSynthesis.speak(utterance);
  }
};

// Also add this helper function to test voices
const testBusinessVoice = () => {
  const testText = "Hello! I'm your DMM AI Assistant. I'm here to help you with your real estate development projects and answer any questions about the Partners Not Paychecks model.";
  
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(testText);
    const voices = window.speechSynthesis.getVoices();
    
    // Find professional female voice
    const businessVoice = voices.find(voice => 
      voice.name.includes('Zira') || 
      (voice.name.toLowerCase().includes('female') && voice.lang.includes('en-US'))
    ) || voices.find(voice => voice.lang.includes('en-US'));
    
    if (businessVoice) {
      utterance.voice = businessVoice;
    }
    
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 0.75;
    
    console.log('🔊 Testing business voice:', businessVoice?.name);
    window.speechSynthesis.speak(utterance);
  }
};

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    console.log('📤 Processing query:', queryText);
    
    setIsLoading(true);
    setQuery('');
    
    // Clear previous response to show loading
    setResponse('');
    setSources([]);

    try {
      const requestBody = {
        query: queryText,
        city: selectedCity,
        context: conversationId ? {
          sessionId: conversationId,
          currentCity: selectedCity,
          messages: [],
          lastQueryTime: new Date(),
          relevantFiles: []
        } : undefined,
        includeContext: true
      };

      console.log('📤 Sending request to /api/query:', requestBody);

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: QueryResponse = await res.json();
      
      console.log('📥 Response data received:', data);
      
      setResponse(data.answer);
      setSources(data.sources || []);
      setLastQueryTime(data.processingTime);
      setConfidence(data.confidence);
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      if (data.suggestedFollowups?.length) {
        setSuggestedFollowups(data.suggestedFollowups);
      }

    } catch (error) {
      console.error('❌ Query error:', error);
      const errorMessage = 'Sorry, I encountered an error processing your query. Please try again.';
      setResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery(query);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">DMM AI Agent</h1>
            <span className="text-purple-200 text-sm">Intelligence System</span>
          </div>
        </div>

        {/* DMM Charts Component */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <BarChart3 className="h-5 w-5" />
              {showCharts ? 'Hide DMM Model Analysis' : 'Show DMM vs Conventional Analysis'}
            </button>
            <p className="text-gray-300 text-sm mt-2">
              See how the "Partners Not Paychecks" model saves time, money & reduces risk
            </p>
          </div>
          
          {showCharts && (
            <div className="mb-8">
              <DMMChartsComponent />
            </div>
          )}
        </div>

        {/* Voice Interface with enhanced handlers */}
        <VoiceInterface 
          onTranscript={handleVoiceTranscript}
          isListening={isVoiceListening}
          selectedLanguage="en-US"
        />
        
        {/* All 4 Buttons - Mobile Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* City Selection Buttons */}
          {Object.entries(cityData).map(([key, city]) => (
            <div
              key={key}
              onClick={() => setSelectedCity(key)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
                selectedCity === key
                  ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                  : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <h3 className="text-sm font-bold text-white">{city.name}</h3>
                <ExternalLink 
                  className="h-3 w-3 text-purple-400 cursor-pointer hover:text-purple-300 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(city.driveUrl, '_blank');
                  }}
                />
              </div>
              <p className="text-gray-300 text-xs leading-tight">{city.description}</p>
            </div>
          ))}

          {/* Action Buttons */}
          <button
            onClick={() => window.open(cityData[selectedCity as keyof typeof cityData].driveUrl, '_blank')}
            className="p-3 rounded-xl border-2 border-green-600 bg-green-500/20 hover:border-green-400 hover:bg-green-500/30 transition-all duration-300 cursor-pointer text-center"
          >
            <div className="flex items-center justify-center mb-1">
              <h3 className="text-sm font-bold text-white">View Media</h3>
              <Image className="h-3 w-3 text-green-400 ml-1" />
            </div>
            <p className="text-gray-300 text-xs">Files & images</p>
          </button>

          <button
            onClick={() => handleQuery(`Give me a comprehensive overview of the ${cityData[selectedCity as keyof typeof cityData].name} project`)}
            disabled={isLoading}
            className="p-3 rounded-xl border-2 border-blue-600 bg-blue-500/20 hover:border-blue-400 hover:bg-blue-500/30 transition-all duration-300 cursor-pointer disabled:opacity-50 text-center"
          >
            <div className="flex items-center justify-center mb-1">
              <h3 className="text-sm font-bold text-white">Get Overview</h3>
              <TrendingUp className="h-3 w-3 text-blue-400 ml-1" />
            </div>
            <p className="text-gray-300 text-xs">Complete analysis</p>
          </button>
        </div>

        {/* Query Input - Mobile Responsive */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about the ${cityData[selectedCity as keyof typeof cityData].name} project...`}
              className="w-full px-4 py-4 pr-16 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => handleQuery(query)}
              disabled={isLoading || !query.trim()}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs"
            >
              {isLoading ? 'Ask' : 'AI'}
            </button>
          </div>
        </div>

        {/* Suggested Questions (always show when not loading) */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">💡 Try asking about {cityData[selectedCity as keyof typeof cityData].name}:</p>
            <div className="grid grid-cols-4 gap-3 max-w-5xl">
              {cityData[selectedCity as keyof typeof cityData].suggestions.slice(0, 8).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuery(suggestion)}
                  className="text-sm px-3 py-2 bg-white/5 hover:bg-white/10 border border-gray-600 hover:border-purple-400 rounded-lg text-gray-300 hover:text-white transition-all duration-200 text-center leading-tight h-10 flex items-center justify-center"
                >
                  <span className="line-clamp-2 text-xs">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Response Display with Pagination */}
        {response && !isLoading && (
          <div className="mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-gray-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    AI Response
                  </h3>
                  {paginatedResponse.length > 1 && (
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {paginatedResponse.length}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakResponse(response)}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 hover:border-green-400 rounded-lg text-green-200 hover:text-white transition-all duration-200"
                  >
                    <span className="text-sm">🔊 Speak</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(response)}
                    className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-400 rounded-lg text-purple-200 hover:text-white transition-all duration-200"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copy</span>
                  </button>
                </div>
              </div>
              
              {/* Current Page Content - Dynamic Height */}
              <div className={`bg-white/5 rounded-lg p-4 mb-4 overflow-y-auto ${
                paginatedResponse.length > 1 
                  ? 'min-h-[300px] max-h-[400px]' 
                  : response.length > 500 
                    ? 'min-h-[200px] max-h-[300px]' 
                    : 'min-h-[80px]'
              }`}>
                <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {paginatedResponse[currentPage - 1] || response}
                </div>
              </div>

              {/* Pagination Controls */}
              {paginatedResponse.length > 1 && (
                <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(paginatedResponse.length, 5) }, (_, i) => {
                      let pageNum;
                      if (paginatedResponse.length <= 5) {
                        pageNum = i + 1;
                      } else {
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= paginatedResponse.length - 2) {
                          pageNum = paginatedResponse.length - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {paginatedResponse.length > 5 && currentPage < paginatedResponse.length - 2 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <button
                          onClick={() => goToPage(paginatedResponse.length)}
                          className="w-8 h-8 rounded-lg bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 hover:text-white transition-all duration-200"
                        >
                          {paginatedResponse.length}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === paginatedResponse.length}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next →
                  </button>
                </div>
              )}
              
              {/* Response metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-700 pt-3 mt-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{lastQueryTime}ms</span>
                </div>
                {confidence > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{Math.round(confidence * 100)}% confidence</span>
                  </div>
                )}
                {sources.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{sources.length} sources analyzed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Smart Follow-up Questions */}
        {suggestedFollowups.length > 0 && response && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">🤔 Continue exploring:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              {suggestedFollowups.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuery(suggestion)}
                  disabled={isLoading}
                  className="text-sm px-4 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-400 rounded-lg text-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-200 disabled:opacity-50 text-left leading-tight min-h-[50px] flex items-center"
                >
                  <span className="line-clamp-2">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator with Progress */}
        {isLoading && (
          <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-600">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              <div className="text-white">
                <p className="font-medium">AI is analyzing {cityData[selectedCity as keyof typeof cityData].name} documents...</p>
                <p className="text-sm text-gray-400">Processing files and generating insights</p>
              </div>
            </div>
            
            {/* Animated progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>DMM AI Agent • Partners Not Paychecks Model • Document Intelligence</p>
          {conversationId && (
            <p className="mt-1 text-xs">Session ID: {conversationId}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DMMAgent;