'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot, CornerDownLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### 👋 Welcome to FreshLane AI Analyst!\nI am powered by **Google Antigravity 2.0** and the **Gemini API**. I can read your Supabase store records in real-time.\n\nAsk me anything, or try these quick options below!`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Which store has the highest wastage?',
    'Show critical East region stores',
    'What format makes the most revenue?',
    'Explain the South region performance'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setInput('');
    setIsLoading(true);

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(updatedMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        throw new Error('API server returned error');
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content || 'I could not process that request. Please try again.'
      }]);

    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `### ❌ Communication Error\nFailed to establish contact with the AI server. Please verify your internet connection and make sure your local server is running.\n\n*Technical Details:* ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render markdown-like sections simply
  const renderMessageContent = (content: string) => {
    // Check if it's markdown or has headings
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-sm font-bold text-slate-100 mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-base font-extrabold text-slate-50 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      // Bullets
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleanText = line.replace(/^[\s*-]+/, '');
        return (
          <li key={index} className="list-disc list-inside text-xs text-slate-350 ml-2 mt-1">
            {formatBold(cleanText)}
          </li>
        );
      }
      // Standard line
      return <p key={index} className="text-xs text-slate-300 leading-relaxed mb-1.5">{formatBold(line)}</p>;
    });
  };

  // Helper to highlight bold markdown blocks **text**
  const formatBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      // Every odd element was matched between **
      if (i % 2 === 1) {
        return <strong key={i} className="text-slate-100 font-bold">{part}</strong>;
      }
      // Inline backticks like `code`
      const subParts = part.split(/`(.*?)`/g);
      return subParts.map((subPart, j) => {
        if (j % 2 === 1) {
          return <code key={j} className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-indigo-300 border border-slate-800">{subPart}</code>;
        }
        return subPart;
      });
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 hover:shadow-indigo-500/30 border border-indigo-400/20"
          aria-label="Open AI chat analyst"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Expanded Chat Screen */}
      {isOpen && (
        <div className="flex flex-col h-[520px] w-[370px] sm:w-[390px] rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-12 duration-200">
          
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight">Retail Analyst</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-400">Supabase & Gemini Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-3.5 border ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600/90 border-indigo-500 text-white rounded-br-none shadow-md' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="space-y-1">
                      {renderMessageContent(msg.content)}
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Loader Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl rounded-bl-none p-4 space-y-2 max-w-[80%] flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="text-[10px] text-slate-400 tracking-wide font-semibold">Gemini is scanning records...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-slate-850 bg-slate-950/20">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1.5">Try a request:</span>
              <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 text-[10px] bg-slate-950 border border-slate-850 hover:border-indigo-500 text-slate-350 hover:text-slate-100 rounded-lg transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about revenue, wastage, stockouts..."
              className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 text-white disabled:text-slate-600 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
