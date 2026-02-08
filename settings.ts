// Settings Manager - Persistent via localStorage

export interface AppSettings {
  webName: string;
  aiName: string;
  logoEmoji: string;
  logoUrl: string | null; // custom uploaded logo (compressed)
  primaryColor: string;
}

const SETTINGS_KEY = 'raai_app_settings_v2';

const defaultSettings: AppSettings = {
  webName: 'RAAI',
  aiName: 'RAAI',
  logoEmoji: '⚡',
  logoUrl: null,
  primaryColor: '#6366f1',
};

export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that all required fields exist
      return {
        webName: parsed.webName || defaultSettings.webName,
        aiName: parsed.aiName || defaultSettings.aiName,
        logoEmoji: parsed.logoEmoji || defaultSettings.logoEmoji,
        logoUrl: parsed.logoUrl || null,
        primaryColor: parsed.primaryColor || defaultSettings.primaryColor,
      };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return { ...defaultSettings };
}

export function saveSettings(settings: AppSettings): { success: boolean; error?: string } {
  try {
    const data = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, data);
    console.log('Settings saved successfully:', settings);
    return { success: true };
  } catch (e: unknown) {
    console.error('Error saving settings:', e);
    // Check if it's a quota exceeded error
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { success: false, error: 'Logo terlalu besar! Gunakan gambar yang lebih kecil (maksimal 2MB).' };
    }
    return { success: false, error: 'Gagal menyimpan settings.' };
  }
}

export function resetSettings(): AppSettings {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error('Error resetting settings:', e);
  }
  return { ...defaultSettings };
}

// Compress image to reduce size for localStorage
export function compressImage(file: File, maxWidth: number = 200, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export { defaultSettings };
