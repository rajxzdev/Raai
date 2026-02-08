import { useState, useCallback, useEffect } from 'react';
import { Sidebar, type ViewType } from '@/components/Sidebar';
import { ChatView, type Message } from '@/components/ChatView';
import { ImageGenerator } from '@/components/ImageGenerator';
import { AdminPanel } from '@/components/AdminPanel';
import { getSettings, saveSettings, type AppSettings } from '@/utils/settings';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export function App() {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Load settings from localStorage on mount
  const [settings, setSettings] = useState<AppSettings>(() => {
    const loaded = getSettings();
    console.log('Initial settings loaded:', loaded);
    return loaded;
  });

  // Update document title when settings change
  useEffect(() => {
    document.title = `${settings.webName} - AI Assistant & Image Generator`;
  }, [settings.webName]);

  // Handle settings change from AdminPanel
  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    console.log('Settings changed:', newSettings);
    setSettings(newSettings);
    
    // Also save to localStorage as backup
    saveSettings(newSettings);
    
    // Update document title immediately
    document.title = `${newSettings.webName} - AI Assistant & Image Generator`;
  }, []);

  const activeSession = chatSessions.find(s => s.id === activeChatId);

  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Chat Baru',
      messages: [],
      timestamp: new Date(),
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveChatId(newSession.id);
    setCurrentView('chat');
  }, []);

  const handleSendMessage = useCallback((messages: Message[]) => {
    if (!activeChatId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'Chat Baru',
        messages,
        timestamp: new Date(),
      };
      setChatSessions(prev => [newSession, ...prev]);
      setActiveChatId(newSession.id);
    } else {
      setChatSessions(prev => prev.map(s =>
        s.id === activeChatId ? { ...s, messages } : s
      ));
    }
  }, [activeChatId]);

  const handleUpdateTitle = useCallback((title: string) => {
    if (activeChatId) {
      setChatSessions(prev => prev.map(s =>
        s.id === activeChatId ? { ...s, title } : s
      ));
    }
  }, [activeChatId]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setCurrentView('chat');
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  }, [activeChatId]);

  const ensureActiveSession = useCallback(() => {
    if (!activeChatId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'Chat Baru',
        messages: [],
        timestamp: new Date(),
      };
      setChatSessions(prev => [newSession, ...prev]);
      setActiveChatId(newSession.id);
      return newSession;
    }
    return activeSession;
  }, [activeChatId, activeSession]);

  const handleSendWithAutoCreate = useCallback((messages: Message[]) => {
    if (!activeChatId) {
      const session = ensureActiveSession();
      if (session) {
        setChatSessions(prev => prev.map(s =>
          s.id === session.id ? { ...s, messages } : s
        ));
      }
    } else {
      handleSendMessage(messages);
    }
  }, [activeChatId, ensureActiveSession, handleSendMessage]);

  return (
    <div className="flex h-screen bg-dark-950 noise-bg overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full blur-[150px] animate-pulse-glow" 
          style={{ backgroundColor: `${settings.primaryColor}15` }}
        />
        <div className="absolute bottom-[-5%] right-[20%] w-[400px] h-[400px] bg-neon-cyan/[0.03] rounded-full blur-[130px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/[0.02] rounded-full blur-[200px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Sidebar */}
      <div className="relative z-20">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          chatHistory={chatSessions.map(s => ({
            id: s.id,
            title: s.title,
            timestamp: s.timestamp,
          }))}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          activeChatId={activeChatId}
          settings={settings}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 min-w-0 overflow-hidden">
        {currentView === 'chat' ? (
          <ChatView
            messages={activeSession?.messages || []}
            onSendMessage={handleSendWithAutoCreate}
            onUpdateTitle={handleUpdateTitle}
            settings={settings}
          />
        ) : (
          <ImageGenerator settings={settings} />
        )}
      </div>

      {/* Admin Panel Modal */}
      {showAdmin && (
        <AdminPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}
