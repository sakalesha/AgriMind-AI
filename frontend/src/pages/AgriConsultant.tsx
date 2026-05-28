import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Info,
  Globe,
  MessageSquare,
  Zap
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '@/src/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AgriConsultant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Agri-Consultant. How can I help you with your farm today? You can ask me about crop diseases, fertilizers, or market trends.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messageText,
        config: {
          systemInstruction: "You are a professional agricultural consultant. Provide concise, expert advice to farmers. Use a helpful and supportive tone."
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that. Could you try rephrasing your question?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        setInputValue("What is the best fertilizer for rice in Punjab?");
      }, 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col premium-card p-0 overflow-hidden border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-agro-card to-agro-neon/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-agro-neon/10 rounded-2xl flex items-center justify-center border border-agro-neon/20">
            <Bot className="w-6 h-6 text-agro-neon" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">AI Agri-Consultant</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-agro-neon uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-agro-neon animate-pulse" />
              Online & Ready to Help
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSpeaking(!isSpeaking)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
          >
            {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400">
            <Globe className="w-4 h-4" /> English
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              message.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
              message.role === 'assistant' ? "bg-agro-neon/10 border border-agro-neon/20" : "bg-white/10 border border-white/10"
            )}>
              {message.role === 'assistant' ? <Bot className="w-5 h-5 text-agro-neon" /> : <User className="w-5 h-5 text-white" />}
            </div>
            <div className="space-y-1">
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                message.role === 'assistant' 
                  ? "bg-white/5 text-zinc-300 rounded-tl-none border border-white/5" 
                  : "bg-agro-neon text-agro-dark font-medium rounded-tr-none shadow-lg shadow-agro-neon/10"
              )}>
                {message.content}
              </div>
              <p className={cn(
                "text-[10px] font-bold text-zinc-600 uppercase tracking-widest",
                message.role === 'user' ? "text-right" : ""
              )}>
                {message.timestamp}
              </p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-10 h-10 rounded-xl bg-agro-neon/10 border border-agro-neon/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-agro-neon" />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-agro-neon/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-agro-neon/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-agro-neon/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/5 bg-agro-dark/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleListening}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-zinc-500 hover:bg-white/10 border border-white/10"
            )}
          >
            <Mic className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? "Listening..." : "Ask your agricultural question..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-agro-neon text-agro-dark rounded-xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <button 
            onClick={() => handleSendMessage("What are the symptoms of Rice Blast?")}
            className="text-[10px] font-bold text-zinc-500 hover:text-agro-neon uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Rice Blast Symptoms
          </button>
          <button 
            onClick={() => handleSendMessage("Best time for wheat sowing?")}
            className="text-[10px] font-bold text-zinc-500 hover:text-agro-neon uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Wheat Sowing Time
          </button>
          <button 
            onClick={() => handleSendMessage("Market price trend for Cotton?")}
            className="text-[10px] font-bold text-zinc-500 hover:text-agro-neon uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Cotton Price Trend
          </button>
        </div>
      </div>
    </div>
  );
};
