import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2, Sparkles } from 'lucide-react';
import { chatWithData } from '../../services/geminiService';
import { CrimeIncident, RegionStats, ChatMessage, Language } from '../../types';
import { TRANSLATIONS } from '../../services/translations';

interface AssistantProps {
  isOpen: boolean;
  onClose: () => void;
  crimes: CrimeIncident[];
  stats: RegionStats[];
  language: Language;
}

const INITIAL_GREETING: Record<Language, string> = {
  en: "Hello. I am Sentinel, your AI Crime Analyst. How can I assist you with the Tashkent dataset?",
  uz: "Assalomu alaykum. Men Sentinel, sizning AI jinoyat tahlilchingizman. Toshkent ma'lumotlari bo'yicha qanday yordam bera olaman?",
  ru: "Здравствуйте. Я Sentinel, ваш ИИ-аналитик по преступности. Чем могу помочь с данными по Ташкенту?"
};

const Assistant: React.FC<AssistantProps> = ({ isOpen, onClose, crimes, stats, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Reset/Set greeting when language or open state changes
  useEffect(() => {
    if (messages.length === 0) {
       setMessages([{
        id: '1',
        role: 'model',
        text: INITIAL_GREETING[language],
        timestamp: new Date()
      }]);
    }
  }, [language, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithData(input, { stats, crimes }, [], language);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I couldn't process that request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: t.chat_error,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-[2000] overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Sentinel AI</h3>
            <p className="text-xs text-blue-400 flex items-center gap-1">
              <Sparkles size={10} /> {t.system_status_online}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-bl-none p-3 border border-slate-700 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-xs text-slate-400">{t.chat_analyzing}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.chat_placeholder}
            className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;