'use client';

import React, { useState, useEffect } from 'react';
import { Copy, FileText, Image, ExternalLink, Sparkles, Clock, TrendingUp } from 'lucide-react';

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

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    setIsLoading(true);
    setQuery('');

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

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: QueryResponse = await res.json();
      
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
      console.error('Query error:', error);
      setResponse('Sorry, I encountered an error processing your query. Please try again.');
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

        {/* All 4 Buttons on One Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* City Selection Buttons */}
          {Object.entries(cityData).map(([key, city]) => (
            <div
              key={key}
              onClick={() => setSelectedCity(key)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
                selectedCity === key
                  ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                  : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <h3 className="text-lg font-bold text-white">{city.name}</h3>
                <ExternalLink 
                  className="h-4 w-4 text-purple-400 cursor-pointer hover:text-purple-300 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(city.driveUrl, '_blank');
                  }}
                />
              </div>
              <p className="text-gray-300 text-xs">{city.description}</p>
            </div>
          ))}

          {/* Action Buttons with Matching Style */}
          <button
            onClick={() => window.open(cityData[selectedCity].driveUrl, '_blank')}
            className="p-4 rounded-xl border-2 border-green-600 bg-green-500/20 hover:border-green-400 hover:bg-green-500/30 transition-all duration-300 cursor-pointer text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <h3 className="text-lg font-bold text-white">View Media</h3>
              <Image className="h-4 w-4 text-green-400 ml-2" />
            </div>
            <p className="text-gray-300 text-xs">{cityData[selectedCity].name} files & images</p>
          </button>

          <button
            onClick={() => handleQuery(`Give me a comprehensive overview of the ${cityData[selectedCity].name} project`)}
            disabled={isLoading}
            className="p-4 rounded-xl border-2 border-blue-600 bg-blue-500/20 hover:border-blue-400 hover:bg-blue-500/30 transition-all duration-300 cursor-pointer disabled:opacity-50 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <h3 className="text-lg font-bold text-white">Get Overview</h3>
              <TrendingUp className="h-4 w-4 text-blue-400 ml-2" />
            </div>
            <p className="text-gray-300 text-xs">Complete project analysis</p>
          </button>
        </div>

        {/* Query Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about the ${cityData[selectedCity].name} project...`}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              disabled={isLoading}
            />
            <button
              onClick={() => handleQuery(query)}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? 'Analyzing...' : 'Ask AI'}
            </button>
          </div>
        </div>

        {/* Suggested Questions (always show when not loading) */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">💡 Try asking about {cityData[selectedCity].name}:</p>
            <div className="grid grid-cols-4 gap-3 max-w-5xl">
              {cityData[selectedCity].suggestions.slice(0, 8).map((suggestion, index) => (
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
                <button
                  onClick={() => copyToClipboard(response)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-400 rounded-lg text-purple-200 hover:text-white transition-all duration-200"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">Copy Full Response</span>
                </button>
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
                <p className="font-medium">AI is analyzing {cityData[selectedCity].name} documents...</p>
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