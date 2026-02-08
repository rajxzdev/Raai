import { useState } from 'react';
import { MessageSquare, ImageIcon, Sparkles, Plus, ChevronLeft, ChevronRight, Trash2, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';
import { type AppSettings } from '@/utils/settings';

export type ViewType = 'chat' | 'image';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  chatHistory: ChatHistory[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  activeChatId: string | null;
  settings: AppSettings;
  onOpenAdmin: () => void;
}

export function Sidebar({ currentView, onViewChange, chatHistory, onNewChat, onSelectChat, onDeleteChat, activeChatId, settings, onOpenAdmin }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative flex flex-col h-screen transition-all duration-300 ease-in-out",
      "bg-dark-950/90 backdrop-blur-xl border-r border-white/[0.06]",
      collapsed ? "w-[68px]" : "w-[270px]"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-neon-cyan to-neon-purple flex items-center justify-center overflow-hidden shadow-lg shadow-primary-500/20">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{settings.logoEmoji}</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-neon-cyan to-neon-purple opacity-30 animate-gradient-shift" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-xl font-extrabold text-gradient tracking-tight">{settings.webName}</h1>
            <p className="text-[10px] text-slate-500 -mt-0.5 font-medium">AI Assistant & Image Gen</p>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl",
            "bg-gradient-to-r from-primary-600/90 to-primary-500/90",
            "hover:from-primary-500 hover:to-primary-400",
            "text-white text-sm font-medium transition-all duration-200",
            "hover:shadow-lg hover:shadow-primary-600/25 active:scale-[0.97]",
            "border border-primary-400/20",
            collapsed && "justify-center px-0"
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Chat Baru</span>}
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 space-y-1">
        <button
          onClick={() => onViewChange('chat')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
            currentView === 'chat'
              ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.06]"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>{settings.aiName} Chat</span>}
          {currentView === 'chat' && !collapsed && (
            <Sparkles className="w-3 h-3 ml-auto text-primary-400" />
          )}
        </button>
        <button
          onClick={() => onViewChange('image')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
            currentView === 'image'
              ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.06]"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <ImageIcon className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <span className="flex items-center gap-2">
              Image Generator
              <span className="px-1.5 py-0.5 text-[8px] bg-neon-green/20 text-neon-green rounded font-bold border border-neon-green/20">AI</span>
            </span>
          )}
        </button>
      </div>

      {/* Chat History */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3 mt-4 gallery-scroll">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600 px-3 mb-2 font-semibold">Riwayat Chat</p>
          <div className="space-y-0.5">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-150",
                  activeChatId === chat.id
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                <span className="truncate flex-1 text-[13px]">{chat.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {chatHistory.length === 0 && (
              <p className="text-xs text-slate-700 px-3 py-6 text-center italic">
                Belum ada riwayat chat
              </p>
            )}
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-dark-600 transition-all z-50 shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Bottom - Admin */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={onOpenAdmin}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
            "text-slate-400 hover:bg-white/[0.06] hover:text-white",
            "border border-white/[0.04] hover:border-white/10",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg shadow-neon-purple/20">
            <Settings className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold text-white truncate">Admin Panel</p>
              <p className="text-[10px] text-slate-600">Kustomisasi Web & AI</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
