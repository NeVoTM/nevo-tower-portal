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
  const [dashboardContext, setDashboardContext] = useState<any>(null);
  const [showReturnButton, setShowReturnButton] = useState(false);

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

  // MMM Dashboard Integration - Check for dashboard context on load
  useEffect(() => {
    const initializeDashboardIntegration = () => {
      console.log('🔗 Initializing MMM Dashboard Integration...');
      
      // Check if user came from MMM Dashboard
      const urlParams = new URLSearchParams(window.location.search);
      const fromDashboard = urlParams.get('source') === 'mmm-dashboard';
      
      if (fromDashboard) {
        console.log('✅ User arrived from MMM Dashboard - enabling enhanced integration');
        
        // Extract dashboard context
        const context = {
          returnUrl: decodeURIComponent(urlParams.get('return_url') || ''),
          currentTab: urlParams.get('current_tab') || 'model',
          version: decodeURIComponent(urlParams.get('version') || ''),
          context: urlParams.get('context') || '',
          timestamp: new Date().toISOString()
        };
        
        // Store context for use throughout the session
        localStorage.setItem('dashboard_integration_context', JSON.stringify(context));
        setDashboardContext(context);
        setShowReturnButton(true);
        
        // Pre-load Miami Makers Model context
        preloadMMMContext();
        
        // Show integration confirmation
        showIntegrationConfirmation();
      }
      
      // Also check if context exists in localStorage (for page refreshes)
      const storedContext = localStorage.getItem('dashboard_integration_context');
      if (storedContext && !fromDashboard) {
        const context = JSON.parse(storedContext);
        setDashboardContext(context);
        setShowReturnButton(true);
      }
    };

    // Initialize on mount
    initializeDashboardIntegration();
  }, []);

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

  // MMM Dashboard Integration Helper Functions
  const preloadMMMContext = () => {
    const mmmContext = {
      project: "Miami Makers Model (MMM) - NeVo Tower Development",
      model: "Partners Not Paychecks, Partners Not Investors",
      location: "1580 79th Street Causeway, North Bay Village, Miami",
      units: "68 luxury residential units + 40 hospitality STR suites",
      value: "$180M project valuation",
      approach: "Equity partnership development model",
      benefits: [
        "Reduced cash requirements through partner equity",
        "2x efficiency gains from 'skin in the game' motivation",
        "Active partner governance (Howey Test compliant)",
        "Zero SEC regulatory requirements",
        "Accelerated timelines (6-12 months faster)",
        "Enhanced quality control through equity alignment"
      ]
    };
    
    localStorage.setItem('ai_preloaded_context', JSON.stringify(mmmContext));
    console.log('✅ MMM context pre-loaded for AI system');
  };

  const showIntegrationConfirmation = () => {
    // Create welcome message notification
    setTimeout(() => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 80px; right: 20px; z-index: 9998;
        background: rgba(0, 0, 0, 0.85); color: #FFD700; padding: 15px 20px;
        border-radius: 15px; font-size: 14px; max-width: 320px; line-height: 1.4;
        box-shadow: 0 8px 25px rgba(108, 92, 231, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.3);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        animation: slideInRight 0.6s ease-out;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <span style="font-size: 18px;">🚀</span>
          <strong>Dashboard Integration Active!</strong>
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
          ✅ MMM context loaded<br>
          ✅ Return navigation enabled<br>
          💡 Look for "Return to Dashboard" button
        </div>
      `;
      
      // Add slide-in animation
      const style = document.createElement('style');
      style.textContent = '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        notification.style.animation = 'slideInRight 0.6s ease-out reverse';
        setTimeout(() => notification.remove(), 600);
      }, 5000);
    }, 800);
  };

  const returnToDashboard = () => {
    if (!dashboardContext) return;
    
    const confirmReturn = confirm('🏗️ Return to MMM Dashboard?\n\n' +
      `📍 You'll return to the "${dashboardContext.currentTab}" tab\n` +
      `🕒 Dashboard version: ${dashboardContext.version}\n\n` +
      'Your AI Agent session will remain open in this tab.\n\n' +
      'Click OK to return to the dashboard.');
    
    if (confirmReturn) {
      if (dashboardContext.returnUrl) {
        // Open dashboard in new tab
        window.open(dashboardContext.returnUrl, '_blank');
        
        // Show success message
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          z-index: 10000; background: rgba(76, 205, 196, 0.95);
          color: white; padding: 20px 30px; border-radius: 15px;
          font-size: 16px; font-weight: bold;
          box-shadow: 0 10px 30px rgba(76, 205, 196, 0.6);
          border: 2px solid #4ECDC4;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        notification.innerHTML = '✅ <strong>Returned to MMM Dashboard!</strong>';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      } else {
        alert('⚠️ Dashboard URL not found. Please bookmark the dashboard for easy access.');
      }
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'}}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6" style={{color: '#FFD700'}} />
            <h1 className="text-2xl font-bold text-white">DMM AI Agent</h1>
            <span className="text-sm" style={{color: '#87CEEB'}}>Intelligence System v6.8</span>
          </div>
        </div>

        {/* Return to Dashboard Button */}
        {showReturnButton && dashboardContext && (
          <div className="fixed top-5 right-5 z-50">
            <button
              onClick={returnToDashboard}
              className="inline-flex items-center gap-2 px-4 py-3 font-bold text-sm rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              style={{
                background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
                color: '#FFD700',
                border: '2px solid #FFD700',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 60, 114, 0.6)';
                e.currentTarget.style.background = 'linear-gradient(45deg, #2a5298, #1e3c72)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(30, 60, 114, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(45deg, #1e3c72, #2a5298)';
              }}
            >
              <span>🏗️</span>
              <span>Return to MMM Dashboard</span>
            </button>
          </div>
        )}

        {/* Dashboard Welcome Message */}
        {dashboardContext && (
          <div className="mb-6 p-4 rounded-xl" style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex items-center gap-3 text-white">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold" style={{color: '#FFD700'}}>Welcome from MMM Dashboard!</h3>
                <p className="text-sm text-gray-300">
                  Context loaded: Miami Makers Model • {dashboardContext.currentTab} tab • {dashboardContext.version}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DMM Charts Component */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="inline-flex items-center gap-3 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: '2px solid rgba(255, 215, 0, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
              }}
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
              className="p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center"
              style={{
                borderColor: selectedCity === key ? '#FFD700' : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: selectedCity === key ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: selectedCity === key ? '0 8px 25px rgba(255, 215, 0, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedCity !== key) {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCity !== key) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <div className="flex items-center justify-center mb-1">
                <h3 className="text-sm font-bold text-white">{city.name}</h3>
                <ExternalLink 
                  className="h-3 w-3 cursor-pointer ml-1 transition-colors duration-200"
                  style={{color: '#87CEEB'}}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFD700'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#87CEEB'}
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
            className="p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer text-center"
            style={{
              borderColor: 'rgba(135, 206, 235, 0.5)',
              backgroundColor: 'rgba(135, 206, 235, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#87CEEB';
              e.currentTarget.style.backgroundColor = 'rgba(135, 206, 235, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(135, 206, 235, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(135, 206, 235, 0.1)';
            }}
          >
            <div className="flex items-center justify-center mb-1">
              <h3 className="text-sm font-bold text-white">View Media</h3>
              <Image className="h-3 w-3 ml-1" style={{color: '#87CEEB'}} />
            </div>
            <p className="text-gray-300 text-xs">Files & images</p>
          </button>

          <button
            onClick={() => handleQuery(`Give me a comprehensive overview of the ${cityData[selectedCity as keyof typeof cityData].name} project`)}
            disabled={isLoading}
            className="p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer disabled:opacity-50 text-center"
            style={{
              borderColor: 'rgba(255, 215, 0, 0.5)',
              backgroundColor: 'rgba(255, 215, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = '#FFD700';
                e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
              }
            }}
          >
            <div className="flex items-center justify-center mb-1">
              <h3 className="text-sm font-bold text-white">Get Overview</h3>
              <TrendingUp className="h-3 w-3 ml-1" style={{color: '#FFD700'}} />
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
              className="w-full px-4 py-4 pr-16 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 text-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FFD700';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={isLoading}
            />
            <button
              onClick={() => handleQuery(query)}
              disabled={isLoading || !query.trim()}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs"
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: '1px solid #FFD700'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && query.trim()) {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && query.trim()) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                }
              }}
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
                  className="text-sm px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-200 text-center leading-tight h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  }}
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
            <div className="backdrop-blur-sm rounded-xl p-6" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5" style={{color: '#FFD700'}} />
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
                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-white transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(135, 206, 235, 0.2)',
                      border: '1px solid rgba(135, 206, 235, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(135, 206, 235, 0.3)';
                      e.currentTarget.style.borderColor = '#87CEEB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(135, 206, 235, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(135, 206, 235, 0.5)';
                    }}
                  >
                    <span className="text-sm">🔊 Speak</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(response)}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-white transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      border: '1px solid rgba(255, 215, 0, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                      e.currentTarget.style.borderColor = '#FFD700';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                    }}
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                      }
                    }}
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
                          className="w-8 h-8 rounded-lg transition-all duration-200 text-white"
                          style={{
                            backgroundColor: currentPage === pageNum 
                              ? '#FFD700' 
                              : 'rgba(255, 255, 255, 0.1)',
                            color: currentPage === pageNum ? '#1e3c72' : '#fff'
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== pageNum) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== pageNum) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }
                          }}
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== paginatedResponse.length) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== paginatedResponse.length) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                      }
                    }}
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
                  className="text-sm px-4 py-3 rounded-lg text-white hover:text-white transition-all duration-200 disabled:opacity-50 text-left leading-tight min-h-[50px] flex items-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.2), rgba(255, 215, 0, 0.1))',
                    border: '1px solid rgba(135, 206, 235, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(135, 206, 235, 0.3), rgba(255, 215, 0, 0.2))';
                      e.currentTarget.style.borderColor = '#87CEEB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(135, 206, 235, 0.2), rgba(255, 215, 0, 0.1))';
                      e.currentTarget.style.borderColor = 'rgba(135, 206, 235, 0.3)';
                    }
                  }}
                >
                  <span className="line-clamp-2">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator with Progress */}
        {isLoading && (
          <div className="mb-6 p-4 backdrop-blur-sm rounded-xl" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{borderColor: '#FFD700'}}></div>
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