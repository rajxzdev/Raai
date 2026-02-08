import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Bot, User, Copy, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { generateAIResponse } from '@/utils/ai';
import { type AppSettings } from '@/utils/settings';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (messages: Message[]) => void;
  onUpdateTitle: (title: string) => void;
  settings: AppSettings;
}

const suggestions = [
  { icon: '💻', text: 'Buatkan script fly di Roblox dengan GUI', color: 'from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20' },
  { icon: '🧮', text: 'Berapa 2847 x 394 + 1283?', color: 'from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20' },
  { icon: '🐍', text: 'Buatkan web scraper dengan Python', color: 'from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20' },
  { icon: '📐', text: 'Jelaskan rumus Pythagoras', color: 'from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20' },
  { icon: '🎮', text: 'Buatkan script speed hack Roblox Lua', color: 'from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20' },
  { icon: '🤖', text: 'Siapa yang membuat kamu?', color: 'from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20' },
];

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08] shadow-lg w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-white/[0.06]">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex-shrink-0",
            copied
              ? "bg-green-500/15 text-green-400 border border-green-500/20"
              : "text-slate-500 hover:text-white hover:bg-white/10 border border-transparent"
          )}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Tersalin!' : 'Salin Kode'}
        </button>
      </div>
      <div className="overflow-hidden w-full">
        <pre className="p-4 bg-dark-900/80 overflow-x-auto text-sm leading-relaxed max-h-[500px] overflow-y-auto w-full">
          <code className="text-slate-300 font-mono text-[13px] whitespace-pre block">{code}</code>
        </pre>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 message-bubble">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-neon-cyan flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass-card rounded-2xl rounded-tl-md px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary-400 typing-dot" />
            <div className="w-2 h-2 rounded-full bg-neon-cyan typing-dot" />
            <div className="w-2 h-2 rounded-full bg-neon-purple typing-dot" />
          </div>
          <span className="text-xs text-slate-500 ml-1">Sedang berpikir...</span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, settings }: { message: Message; settings: AppSettings }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopyAll = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0]?.trim() || '';
        const code = lines.slice(lang ? 1 : 0).join('\n').trim();
        return <CodeBlock key={i} code={code} lang={lang} />;
      }

      const lines = part.split('\n');
      return (
        <div key={i} className="min-w-0 overflow-hidden">
          {lines.map((line, li) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('### ')) return <h3 key={li} className="text-base font-bold text-white mt-3 mb-1 break-words">{renderInline(trimmed.slice(4))}</h3>;
            if (trimmed.startsWith('## ')) return <h2 key={li} className="text-lg font-bold text-white mt-3 mb-1 break-words">{renderInline(trimmed.slice(3))}</h2>;
            if (trimmed.startsWith('# ')) return <h1 key={li} className="text-xl font-bold text-white mt-3 mb-1 break-words">{renderInline(trimmed.slice(2))}</h1>;
            if (trimmed.startsWith('> ')) return <blockquote key={li} className="border-l-2 border-primary-400/60 pl-3 my-2 italic text-slate-300 break-words">{renderInline(trimmed.slice(2))}</blockquote>;
            if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) return <li key={li} className="ml-4 list-disc text-slate-300 leading-relaxed my-0.5 break-words">{renderInline(trimmed.slice(2))}</li>;
            if (/^\d+\.\s/.test(trimmed)) return <li key={li} className="ml-4 list-decimal text-slate-300 leading-relaxed my-0.5 break-words">{renderInline(trimmed.replace(/^\d+\.\s/, ''))}</li>;
            if (trimmed === '') return <div key={li} className="h-2" />;
            return <p key={li} className="text-slate-300 leading-relaxed break-words">{renderInline(line)}</p>;
          })}
        </div>
      );
    });
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-white break-words">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) return <em key={i} className="italic text-slate-200 break-words">{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="px-1.5 py-0.5 rounded-md bg-dark-700 text-primary-300 text-[12px] font-mono border border-white/[0.06] break-all">{part.slice(1, -1)}</code>;
      return <span key={i} className="break-words">{part}</span>;
    });
  };

  return (
    <div className={cn("flex items-start gap-3 message-bubble", isUser && "ml-auto flex-row-reverse")}
         style={{ maxWidth: 'min(85%, 720px)' }}>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg",
        isUser
          ? "bg-gradient-to-br from-neon-purple to-neon-pink shadow-neon-purple/20"
          : "bg-gradient-to-br from-primary-500 to-neon-cyan shadow-primary-500/20"
      )}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={cn(
        "rounded-2xl px-4 py-3 group relative min-w-0 overflow-hidden",
        isUser
          ? "bg-gradient-to-br from-primary-600/90 to-primary-700/90 rounded-tr-md text-white border border-primary-500/20 shadow-lg shadow-primary-600/10"
          : "glass-card rounded-tl-md"
      )}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold text-primary-400">{settings.aiName}</span>
          </div>
        )}
        {isUser ? (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm space-y-0.5 break-words overflow-hidden min-w-0">{renderContent(message.content)}</div>
        )}

        {!isUser && message.content.length > 0 && (
          <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopyAll} className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Tersalin!' : 'Salin Semua'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatView({ messages, onSendMessage, onUpdateTitle, settings }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isFirstMessage = messages.length === 0;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    onSendMessage(newMessages);
    setInput('');
    setIsTyping(true);

    if (isFirstMessage) {
      onUpdateTitle(messageText.slice(0, 40) + (messageText.length > 40 ? '...' : ''));
    }

    try {
      // Build conversation history for context (only role + content, no extra fields)
      const history = newMessages
        .filter(m => m.content.length > 0)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const responseText = await generateAIResponse(messageText, history);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      onSendMessage([...newMessages, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat memproses permintaan. Pastikan koneksi internet stabil dan coba lagi. 🔄',
        timestamp: new Date()
      };
      onSendMessage([...newMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-dark-950/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-50" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              {settings.aiName} Chat
              <span className="px-1.5 py-0.5 text-[9px] bg-primary-600/20 text-primary-300 rounded-full font-bold border border-primary-500/20 flex-shrink-0">SMART AI</span>
            </h2>
            <p className="text-[10px] text-slate-600">Powered by Real AI — Bisa jawab matematika, coding, apa saja!</p>
          </div>
        </div>
        <button
          onClick={() => { onSendMessage([]); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
        {isFirstMessage ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
            {/* Hero */}
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 via-neon-cyan to-neon-purple flex items-center justify-center animate-float shadow-2xl shadow-primary-500/30 overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{settings.logoEmoji}</span>
                )}
              </div>
              <div className="absolute -inset-6 bg-gradient-to-br from-primary-500/15 via-neon-cyan/10 to-neon-purple/15 rounded-3xl blur-2xl -z-10 animate-pulse-glow" />
              <div className="absolute -top-2 -right-4 w-4 h-4 rounded-full bg-neon-cyan shadow-lg shadow-neon-cyan/50 animate-float" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-3 -left-3 w-3 h-3 rounded-full bg-neon-pink shadow-lg shadow-neon-pink/50 animate-float" style={{ animationDelay: '1.5s' }} />
            </div>

            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
              Halo! Saya <span className="text-gradient">{settings.aiName}</span>
            </h1>
            <p className="text-slate-400 text-center mb-10 max-w-md leading-relaxed">
              AI cerdas yang bisa <strong className="text-white">menghitung matematika</strong>, <strong className="text-white">menulis kode</strong>, <strong className="text-white">menjelaskan sains</strong>, dan menjawab apa saja!
            </p>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl text-left text-sm text-slate-300",
                    "bg-gradient-to-br border border-white/[0.06]",
                    "hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-600/10",
                    "transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
                    "animate-fade-in-up",
                    s.color
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-medium">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto w-full min-w-0 overflow-hidden">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} settings={settings} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-4 pt-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto w-full">
          <div className={cn(
            "relative glass-card rounded-2xl transition-all duration-300",
            "focus-within:border-primary-500/30 focus-within:shadow-lg focus-within:shadow-primary-600/10",
            "focus-within:ring-1 focus-within:ring-primary-500/10"
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Tanya ${settings.aiName} apa saja — matematika, coding, sains...`}
              rows={1}
              className="w-full bg-transparent text-white placeholder-slate-600 text-sm px-5 py-4 pr-14 resize-none focus:outline-none max-h-32"
              style={{ minHeight: '52px' }}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={cn(
                "absolute right-2.5 bottom-2.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                input.trim() && !isTyping
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-600/30 active:scale-90 border border-primary-400/30"
                  : "bg-white/[0.03] text-slate-700 border border-white/[0.04]"
              )}
            >
              {isTyping ? (
                <div className="w-4 h-4 border-2 border-slate-600 border-t-primary-400 rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-700 text-center mt-2.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            {settings.aiName} — AI sungguhan, bisa jawab matematika, coding & apa saja!
          </p>
        </div>
      </div>
    </div>
  );
}
