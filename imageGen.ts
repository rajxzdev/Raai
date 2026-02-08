// RAAI Image Generation Engine using Pollinations.ai
// Generates REAL AI images (people, objects, scenes) via free API

export interface ImageGenParams {
  prompt: string;
  mode: '2d' | '3d';
  width?: number;
  height?: number;
}

// Enhance prompt based on mode
function enhancePrompt(prompt: string, mode: '2d' | '3d'): string {
  const base = prompt.trim();

  if (mode === '3d') {
    return `${base}, 3D render, ultra realistic, octane render, cinema 4D, unreal engine 5, volumetric lighting, ray tracing, photorealistic, 8K, highly detailed, studio lighting, professional 3D artwork`;
  }

  // 2D mode
  return `${base}, digital art, illustration, highly detailed, beautiful composition, vibrant colors, professional artwork, trending on artstation, masterpiece, 4K`;
}

// Generate image URL via Pollinations.ai
export function getImageUrl(params: ImageGenParams): string {
  const { prompt, mode, width = 768, height = 768 } = params;
  const enhanced = enhancePrompt(prompt, mode);
  const encoded = encodeURIComponent(enhanced);
  // Add random seed for variation
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

// Preload image and return blob URL for reliability
export async function generateImage(params: ImageGenParams): Promise<string> {
  const url = getImageUrl(params);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
