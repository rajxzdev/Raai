import { useState, useEffect } from 'react';
import { AppSettings, saveSettings, compressImage, resetSettings as resetToDefault } from '@/utils/settings';

interface AdminPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClose: () => void;
}

const ADMIN_PASSWORD = 'rajxz09';

const colorOptions = [
  { value: '#6366f1', name: 'Indigo' },
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#10b981', name: 'Emerald' },
  { value: '#f43f5e', name: 'Rose' },
  { value: '#f97316', name: 'Orange' },
  { value: '#eab308', name: 'Yellow' },
  { value: '#ec4899', name: 'Pink' },
];

const emojiOptions = ['⚡', '🤖', '🧠', '✨', '🚀', '💎', '🔮', '🎯', '💡', '🌟', '🔥', '💫'];

export function AdminPanel({ settings, onSettingsChange, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Password salah!');
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleSave = () => {
    const result = saveSettings(localSettings);
    
    if (result.success) {
      onSettingsChange(localSettings);
      setSaveMessage({ type: 'success', text: '✓ Settings berhasil disimpan!' });
      
      // Update document title immediately
      document.title = `${localSettings.webName} - AI Assistant`;
      
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Gagal menyimpan!' });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleReset = () => {
    if (confirm('Reset semua settings ke default?')) {
      const defaultSettings = resetToDefault();
      setLocalSettings(defaultSettings);
      onSettingsChange(defaultSettings);
      setSaveMessage({ type: 'success', text: '✓ Settings direset ke default!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar!');
      return;
    }

    // Check file size (max 10MB for upload, will be compressed)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 10MB!');
      return;
    }

    setUploadingLogo(true);
    setUploadError('');

    try {
      // Compress image to max 200px width for logo
      const compressedDataUrl = await compressImage(file, 200, 0.8);
      setLocalSettings(prev => ({ ...prev, logoUrl: compressedDataUrl }));
      setUploadError('');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Gagal mengupload gambar!');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLocalSettings(prev => ({ ...prev, logoUrl: null }));
  };

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  };

  const headerStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#e0e0e0',
    marginBottom: '8px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: localSettings.primaryColor,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#999',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div 
          style={{
            ...modalStyle,
            maxWidth: '380px',
            padding: '40px 32px',
            textAlign: 'center',
          }} 
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>Admin Panel</h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
            Masukkan password untuk mengakses
          </p>
          
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Password"
              style={{
                ...inputStyle,
                paddingRight: '48px',
                borderColor: passwordError ? '#ef4444' : 'rgba(255,255,255,0.15)',
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          
          {passwordError && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
              ❌ {passwordError}
            </p>
          )}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{ ...buttonSecondaryStyle, flex: 1 }}
            >
              Batal
            </button>
            <button
              onClick={handleLogin}
              style={{ ...buttonPrimaryStyle, flex: 1 }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Panel (Authenticated)
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ color: 'white', fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Admin Panel
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                backgroundColor: '#22c55e',
                color: 'white',
                borderRadius: '9999px',
              }}>
                VERIFIED
              </span>
            </h2>
            <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0 0' }}>
              Kelola settings website
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Save Message */}
          {saveMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: saveMessage.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${saveMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
              color: saveMessage.type === 'success' ? '#22c55e' : '#ef4444',
              fontSize: '14px',
            }}>
              {saveMessage.text}
            </div>
          )}

          {/* Website Name */}
          <div style={sectionStyle}>
            <label style={labelStyle}>🏷️ Nama Website</label>
            <input
              type="text"
              value={localSettings.webName}
              onChange={e => setLocalSettings(prev => ({ ...prev, webName: e.target.value }))}
              style={inputStyle}
              placeholder="Contoh: RAAI"
            />
            <p style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>
              Ditampilkan di sidebar dan browser tab
            </p>
          </div>

          {/* AI Name */}
          <div style={sectionStyle}>
            <label style={labelStyle}>🤖 Nama AI</label>
            <input
              type="text"
              value={localSettings.aiName}
              onChange={e => setLocalSettings(prev => ({ ...prev, aiName: e.target.value }))}
              style={inputStyle}
              placeholder="Contoh: RAAI"
            />
            <p style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>
              Nama yang digunakan AI saat merespon
            </p>
          </div>

          {/* Logo */}
          <div style={sectionStyle}>
            <label style={labelStyle}>🎨 Logo</label>
            
            {/* Emoji Options */}
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Pilih emoji:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {emojiOptions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setLocalSettings(prev => ({ ...prev, logoEmoji: emoji, logoUrl: null }))}
                  style={{
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    border: localSettings.logoEmoji === emoji && !localSettings.logoUrl 
                      ? `2px solid ${localSettings.primaryColor}` 
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    backgroundColor: localSettings.logoEmoji === emoji && !localSettings.logoUrl
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Upload Option */}
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Atau upload gambar:</p>
            
            {localSettings.logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={localSettings.logoUrl} 
                  alt="Logo" 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }} 
                />
                <button
                  onClick={removeLogo}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🗑️ Hapus Logo
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#888',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                {uploadingLogo ? '⏳ Mengupload...' : '📁 Klik untuk upload logo'}
              </label>
            )}
            
            {uploadError && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>❌ {uploadError}</p>
            )}
            
            <p style={{ color: '#666', fontSize: '11px', marginTop: '8px' }}>
              Gambar akan di-compress otomatis untuk penyimpanan
            </p>
          </div>

          {/* Accent Color */}
          <div style={sectionStyle}>
            <label style={labelStyle}>🎨 Warna Aksen</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  onClick={() => setLocalSettings(prev => ({ ...prev, primaryColor: color.value }))}
                  title={color.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: color.value,
                    border: localSettings.primaryColor === color.value 
                      ? '3px solid white' 
                      : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: localSettings.primaryColor === color.value 
                      ? `0 0 12px ${color.value}` 
                      : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            ...sectionStyle,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}>
            <label style={labelStyle}>👁️ Preview</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
            }}>
              {localSettings.logoUrl ? (
                <img 
                  src={localSettings.logoUrl} 
                  alt="Logo" 
                  style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: localSettings.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {localSettings.logoEmoji}
                </div>
              )}
              <div>
                <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>{localSettings.webName}</p>
                <p style={{ color: '#888', fontSize: '12px', margin: '2px 0 0 0' }}>
                  AI: {localSettings.aiName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          gap: '12px',
        }}>
          <button onClick={handleReset} style={buttonSecondaryStyle}>
            🔄 Reset
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{ ...buttonSecondaryStyle, marginLeft: 'auto' }}
          >
            🚪 Logout
          </button>
          <button onClick={handleSave} style={buttonPrimaryStyle}>
            💾 Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
