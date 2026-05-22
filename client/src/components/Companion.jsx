import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, User, Trash2, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const Companion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi there! I am your EduAI Floating Study Companion. Ask me anything about your subjects, resume, career roadmaps, or learning schedules!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: 'Create a study timetable', prompt: 'Create a highly effective weekly study timetable for a computer science student.' },
    { label: 'Explain recursion simply', prompt: 'Explain the concept of recursion in programming with a simple real-world analogy and code.' },
    { label: 'How to build an ATS resume?', prompt: 'Give me 5 actionable steps and power verbs to optimize my resume for ATS scanners.' },
    { label: 'Give me a motivation boost', prompt: 'I feel a bit overwhelmed and unmotivated with my studies today. Give me a strategic boost and study tips.' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await api.post('/tutor/ask', {
        question: text,
        subject: 'General'
      });

      const reply = response.data?.data?.answer || 'I am sorry, I encountered an issue generating a response.';
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: reply
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'The AI service is currently feeling a bit overloaded. Please try again in a few seconds!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Hi there! I am your EduAI Floating Study Companion. Ask me anything about your subjects, resume, career roadmaps, or learning schedules!'
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-geist">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="w-[360px] md:w-[400px] h-[520px] bg-[#0c0a1b]/95 border border-indigo-500/20 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 relative"
          >
            {/* Background glowing effects */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 px-5 py-4 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-950/50">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                    EduAI Companion
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">AI Study Buddy</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  title="Clear Chat History"
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 flex items-center justify-center transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${!isAssistant ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                      isAssistant
                        ? 'bg-slate-900 border-slate-800 text-indigo-400'
                        : 'bg-indigo-600 border-indigo-500 text-white'
                    }`}>
                      {isAssistant ? <Bot size={14} /> : <User size={14} />}
                    </div>
                    
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-900/60 border border-slate-800/80 text-slate-200 rounded-tl-sm'
                        : 'bg-indigo-950/40 border border-indigo-500/20 text-indigo-100 rounded-tr-sm'
                    }`}>
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Quick actions if only welcome message is present */}
              {messages.length === 1 && (
                <div className="mt-6 space-y-2.5 animate-fadeIn">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Suggested Prompts</p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickPrompts.map((qp, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(qp.prompt)}
                        className="text-left w-full p-3 bg-slate-950/40 hover:bg-[#120f26]/40 border border-slate-900 hover:border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-indigo-300 transition group"
                      >
                        <span className="truncate pr-4">{qp.label}</span>
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/20 relative z-10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask something..."
                disabled={loading}
                className="flex-1 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition placeholder-slate-500 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center border border-white/10 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 text-white flex items-center justify-center shadow-lg border border-white/20 relative group overflow-hidden"
        style={{
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.4), 0 0 50px rgba(236, 72, 153, 0.2)'
        }}
      >
        {/* Soft rotating pulse */}
        <span className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
        
        {isOpen ? (
          <X size={24} className="relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <Bot size={24} className="group-hover:scale-95 transition-transform" />
            <Sparkles size={12} className="absolute -top-1.5 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default Companion;
