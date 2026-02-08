import { useState, useRef } from 'react';
import { ImageIcon, Download, Sparkles, Wand2, RotateCcw, Loader2, Box, Layers, AlertCircle, X, ZoomIn, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { generateImage, type ImageGenParams } from '@/utils/imageGen';

type ImageMode = '2d' | '3d';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  mode: ImageMode;
  timestamp: Date;
}

const examplePrompts2D = [
  { emoji: '🎨', text: 'A cat sitting on a windowsill watching rain, cozy illustration' },
  { emoji: '🌅', text: 'Beautiful sunset over Japanese mountains with cherry blossoms' },
  { emoji: '🧑‍🍳', text: 'A chef cooking in a warm kitchen, steam rising from pots' },
  { emoji: '🐉', text: 'A majestic dragon flying over a medieval castle' },
  { emoji: '🌊', text: 'Surfer riding a giant wave at golden hour' },
  { emoji: '🎭', text: 'Portrait of a mysterious woman with flowers in her hair' },
  { emoji: '🏙️', text: 'Cyberpunk city at night with neon lights and flying cars' },
  { emoji: '🍜', text: 'A person eating ramen in a small Tokyo street shop' },
];

const examplePrompts3D = [
  { emoji: '🤖', text: 'Futuristic robot standing in a sci-fi laboratory' },
  { emoji: '🏠', text: 'Cozy miniature house on a floating island' },
  { emoji: '🎮', text: 'Game character warrior with glowing sword' },
  { emoji: '🚗', text: 'Sleek futuristic sports car in a showroom' },
  { emoji: '👤', text: 'A person reading a book in a magical forest' },
  { emoji: '🍕', text: 'Delicious pizza with toppings, food photography' },
  { emoji: '🦁', text: 'Majestic lion portrait with dramatic lighting' },
  { emoji: '🏰', text: 'Fantasy castle floating in the clouds at sunset' },
];

import { type AppSettings } from '@/utils/settings';

interface ImageGeneratorProps {
  settings: AppSettings;
}

export function ImageGenerator({ settings }: ImageGeneratorProps) {
  const [mode, setMode] = useState<ImageMode>('2d');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GeneratedImage | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (text?: string) => {
    const promptText = text || prompt.trim();
    if (!promptText || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setPrompt('');

    try {
      const params: ImageGenParams = {
        prompt: promptText,
        mode,
        width: 768,
        height: 768,
      };

      const imageUrl = await generateImage(params);

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: promptText,
        mode,
        timestamp: new Date(),
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
    } catch {
      setError('Gagal generate gambar. Coba lagi atau gunakan prompt berbeda.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `raai-${image.mode}-${image.id}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback
      const link = document.createElement('a');
      link.download = `raai-${image.mode}-${image.id}.png`;
      link.href = image.url;
      link.click();
    }
  };

  const suggestions = mode === '2d' ? examplePrompts2D : examplePrompts3D;
  const visibleSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 4);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-dark-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-lg shadow-neon-purple/20">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              {settings.aiName} Image Generator
              <span className="px-1.5 py-0.5 text-[9px] bg-neon-green/15 text-neon-green rounded-full font-bold border border-neon-green/20">REAL AI</span>
            </h2>
            <p className="text-[10px] text-slate-500">Powered by Pollinations AI — Generate gambar nyata!</p>
          </div>
        </div>
        {generatedImages.length > 0 && (
          <div className="text-[11px] text-slate-500">
            {generatedImages.length} gambar dihasilkan
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('2d')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                mode === '2d'
                  ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25 border border-primary-400/30"
                  : "glass-card text-slate-400 hover:text-white hover:border-white/10"
              )}
            >
              <Layers className="w-4 h-4" />
              2D Art & Illustration
            </button>
            <button
              onClick={() => setMode('3d')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                mode === '3d'
                  ? "bg-gradient-to-r from-neon-cyan to-neon-blue text-white shadow-lg shadow-neon-cyan/25 border border-neon-cyan/30"
                  : "glass-card text-slate-400 hover:text-white hover:border-white/10"
              )}
            >
              <Box className="w-4 h-4" />
              3D Render
            </button>
          </div>

          {/* Input Area */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder={mode === '2d' ? "Contoh: Seorang anak bermain layangan di sawah saat sunset..." : "Contoh: 3D render astronaut berjalan di bulan..."}
                  className="w-full bg-dark-800 text-white text-sm placeholder-slate-600 px-4 py-3.5 rounded-xl border border-white/[0.06] focus:border-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
                  disabled={isGenerating}
                />
                <Wand2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              </div>
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isGenerating}
                className={cn(
                  "flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 min-w-[140px] justify-center",
                  prompt.trim() && !isGenerating
                    ? "bg-gradient-to-r from-primary-500 to-neon-cyan text-white hover:shadow-lg hover:shadow-primary-500/30 active:scale-[0.97] border border-primary-400/20"
                    : "bg-white/[0.03] text-slate-700 cursor-not-allowed border border-white/[0.04]"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading Animation */}
            {isGenerating && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-primary-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
                    <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-neon-cyan animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">AI sedang membuat gambar...</p>
                    <p className="text-[11px] text-slate-500">Menggunakan AI untuk generate "{prompt || 'gambar'}" dalam mode {mode.toUpperCase()}</p>
                  </div>
                </div>
                <div className="w-full h-1 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 via-neon-cyan to-neon-purple rounded-full progress-striped animate-shimmer" style={{ width: '60%' }} />
                </div>
              </div>
            )}
          </div>

          {/* Preview & Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Preview */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl overflow-hidden">
                {selectedImage ? (
                  <div className="relative group">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.prompt}
                      className="w-full aspect-square object-cover animate-img-load"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                            selectedImage.mode === '2d'
                              ? "bg-primary-600/50 text-primary-200 border border-primary-400/30"
                              : "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                          )}>
                            {selectedImage.mode} mode
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {selectedImage.timestamp.toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium leading-relaxed">{selectedImage.prompt}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(selectedImage)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PNG
                          </button>
                          <button
                            onClick={() => { setPrompt(selectedImage.prompt); setMode(selectedImage.mode); handleGenerate(selectedImage.prompt); }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Regenerate
                          </button>
                          <button
                            onClick={() => setLightbox(selectedImage)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            Full View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center p-8">
                    <div className="relative mb-8">
                      <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center border border-white/[0.06] shadow-2xl">
                        <ImageIcon className="w-14 h-14 text-slate-800" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-neon-cyan flex items-center justify-center animate-float shadow-lg shadow-primary-500/30">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center animate-float shadow-lg shadow-neon-purple/30" style={{ animationDelay: '1s' }}>
                        <Wand2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Buat Gambar AI Nyata</h3>
                    <p className="text-sm text-slate-500 text-center max-w-sm leading-relaxed">
                      Ketik deskripsi apa saja — orang, hewan, pemandangan, objek — dan AI akan membuatkan gambar nyata untuk Anda!
                    </p>
                    <div className="flex items-center gap-3 mt-6">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
                        <Layers className="w-3 h-3 text-primary-400" />
                        <span className="text-[11px] text-primary-300 font-medium">2D Illustration</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                        <Box className="w-3 h-3 text-neon-cyan" />
                        <span className="text-[11px] text-neon-cyan font-medium">3D Render</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Sidebar */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1">
                <Layers className="w-3.5 h-3.5" />
                Gallery ({generatedImages.length})
              </h3>
              <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto pr-1 gallery-scroll">
                {generatedImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      "w-full rounded-xl overflow-hidden border transition-all duration-200 group animate-fade-in-up",
                      selectedImage?.id === img.id
                        ? "border-primary-500/50 shadow-lg shadow-primary-600/15 ring-1 ring-primary-500/20"
                        : "border-white/[0.06] hover:border-white/15"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <img src={img.url} alt={img.prompt} className="w-full aspect-video object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-[10px] text-white/90 truncate font-medium">{img.prompt}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={cn(
                              "px-1.5 py-0.5 text-[8px] font-bold rounded uppercase",
                              img.mode === '2d' ? "bg-primary-600/60 text-primary-200" : "bg-neon-cyan/30 text-neon-cyan"
                            )}>
                              {img.mode}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {img.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Quick actions on hover */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(img); }}
                          className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setLightbox(img); }}
                          className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
                {generatedImages.length === 0 && (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <ImageIcon className="w-10 h-10 text-slate-800 mx-auto mb-3" />
                    <p className="text-xs text-slate-600 font-medium">Belum ada gambar</p>
                    <p className="text-[10px] text-slate-700 mt-1">Generate gambar pertamamu!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              Contoh Prompt — Klik untuk Generate!
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {visibleSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(s.text); handleGenerate(s.text); }}
                  disabled={isGenerating}
                  className={cn(
                    "flex items-start gap-2.5 px-3.5 py-3 text-xs text-slate-400 bg-dark-800/80 rounded-xl",
                    "hover:bg-dark-700 hover:text-white transition-all text-left",
                    "border border-white/[0.04] hover:border-primary-500/20",
                    "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                    "animate-fade-in-up"
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-base mt-0.5">{s.emoji}</span>
                  <span className="leading-relaxed">{s.text}</span>
                </button>
              ))}
            </div>
            {suggestions.length > 4 && (
              <button
                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-primary-400 transition-colors mx-auto"
              >
                <ChevronDown className={cn("w-3 h-3 transition-transform", showAllSuggestions && "rotate-180")} />
                {showAllSuggestions ? 'Sembunyikan' : `Lihat ${suggestions.length - 4} lainnya`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-[90vw] max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.prompt}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-white/80 max-w-xl truncate">{lightbox.prompt}</p>
              <button
                onClick={() => handleDownload(lightbox)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
