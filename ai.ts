// RAAI - Real AI Engine using Pollinations.ai Text API
// FIXED: Proper JSON parsing, no raw JSON output, no ads, no LaTeX

import { getSettings } from './settings';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Check if user is asking about the creator/maker of RAAI
function isAskingAboutCreator(msg: string): string | null {
  const lower = msg.toLowerCase();
  const creatorKeywords = [
    'siapa yang buat', 'siapa yang membuat', 'siapa pembuat', 'siapa pencipta',
    'siapa yang bikin', 'siapa yang ngebuat', 'siapa yang develop', 'siapa developer',
    'who made', 'who created', 'who built', 'who developed', 'who is the creator',
    'who is the developer', 'who is the maker', 'who designed',
    'dibuat oleh siapa', 'dikembangkan oleh siapa', 'diciptakan oleh siapa',
    'siapa di balik', 'siapa dibalik', 'creator', 'pembuat', 'pencipta',
    'developer nya siapa', 'developernya siapa', 'yang buat siapa',
    'lu dibuat siapa', 'kamu dibuat siapa', 'anda dibuat siapa',
    'lo dibuat siapa', 'kau dibuat siapa', 'kamu siapa yang buat',
    'siapa yang create', 'yang bikin siapa', 'yang develop siapa',
    'buatan siapa', 'ciptaan siapa', 'karya siapa',
    'founder', 'pendiri', 'who owns', 'siapa pemilik', 'pemilik',
    'tentang raai', 'about raai', 'apa itu raai', 'what is raai'
  ];

  for (const keyword of creatorKeywords) {
    if (lower.includes(keyword)) {
      const settings = getSettings();
      return `${settings.aiName} diciptakan oleh **rajxzdev** 🚀

**rajxzdev** adalah seorang **solo web developer** yang sangat terampil dan lihai di bidangnya. Beliau memiliki keahlian luar biasa dalam:

- 💻 **Web Development** — Mahir dalam membangun website modern dengan teknologi terkini seperti React, TypeScript, Next.js, dan berbagai framework lainnya
- 🎮 **Game Development** — Berpengalaman dalam coding game, terutama di platform **Roblox** menggunakan Lua/Luau
- 🤖 **AI Integration** — Mampu mengintegrasikan teknologi AI ke dalam berbagai aplikasi web
- 🎨 **UI/UX Design** — Memiliki kemampuan desain antarmuka yang elegan dan user-friendly

rajxzdev bekerja secara solo namun menghasilkan karya-karya berkualitas tinggi. ${settings.aiName} adalah salah satu bukti nyata dari keahlian beliau — sebuah AI assistant yang powerful dengan antarmuka yang modern dan fitur lengkap! ✨`;
    }
  }
  return null;
}

function buildSystemPrompt(): string {
  const settings = getSettings();
  return `You are ${settings.aiName}, a highly intelligent, helpful, and friendly AI assistant. You were created by rajxzdev, a skilled solo web developer who excels in website coding and game coding like Roblox.

CRITICAL RULES YOU MUST FOLLOW:

1. NEVER use LaTeX formatting. NEVER use \\( \\) or \\[ \\] or \\boxed{} or \\frac{} or \\times or \\sqrt{} or \\text{} or $ $ or $$ $$ or ANY LaTeX syntax whatsoever.

2. For math, write everything in PLAIN TEXT:
   - Multiplication: use x or * (NOT \\times)
   - Division: use / (NOT \\div)
   - Square root: use sqrt() (NOT \\sqrt)
   - Fractions: write a/b (NOT \\frac{a}{b})
   - Powers: write x^2 or x squared (NOT x^{2})
   - Final answers: write the number directly (NOT \\boxed{})

3. For code, ALWAYS wrap in markdown code blocks with the language specified:
\`\`\`python
print("Hello")
\`\`\`

4. Answer in the SAME language as the user. If they write Indonesian, respond in Indonesian. If English, respond in English.

5. Give CLEAR, STRUCTURED, and COMPLETE answers. Use bullet points, numbered lists, and **bold** for clarity.

6. For math problems, ALWAYS show step-by-step calculations clearly and give a definitive final answer.

7. DO NOT add any ads, promotions, links, or watermarks in your response.

8. DO NOT include any JSON, metadata, reasoning_content, or tool_calls in your response. Just respond with clean text.

9. If asked who created/made you, say: "I was created by rajxzdev, a talented solo web developer who excels in website and game development (especially Roblox)."

CORRECT math example:
Question: 1 x 10 = ?
Answer: 1 x 10 = 10

Question: 2847 x 394 + 1283 = ?
Answer:
Step 1: 2847 x 394 = 1,121,718
Step 2: 1,121,718 + 1,283 = 1,123,001
Final answer: 1,123,001

WRONG (NEVER do this):
\\(1 \\times 10 = \\boxed{10}\\) ← WRONG!
$2 + 3 = 5$ ← WRONG!

You are an expert in: Mathematics, Programming (Python, JavaScript, TypeScript, Java, C++, Lua/Roblox, Go, Rust, SQL, HTML/CSS, React), Science, History, and any topic.`;
}

// Extract clean text content from API response
function extractContent(rawText: string): string {
  // Try to parse as JSON first - the API sometimes returns JSON objects
  try {
    const parsed = JSON.parse(rawText);
    
    // If it's an object with 'content' field
    if (parsed && typeof parsed === 'object') {
      // OpenAI-style response: { choices: [{ message: { content: "..." } }] }
      if (parsed.choices && Array.isArray(parsed.choices) && parsed.choices[0]?.message?.content) {
        return parsed.choices[0].message.content;
      }
      // Direct content field
      if (typeof parsed.content === 'string') {
        return parsed.content;
      }
      // Role+content object: { role: "assistant", content: "..." }
      if (parsed.role === 'assistant' && typeof parsed.content === 'string') {
        return parsed.content;
      }
      // Message field
      if (typeof parsed.message === 'string') {
        return parsed.message;
      }
      // Text field
      if (typeof parsed.text === 'string') {
        return parsed.text;
      }
      // Response field
      if (typeof parsed.response === 'string') {
        return parsed.response;
      }
      // If it's an object but we couldn't find the content, stringify is wrong
      // Try to find ANY string field that looks like actual content
      for (const key of Object.keys(parsed)) {
        if (typeof parsed[key] === 'string' && parsed[key].length > 20 && key !== 'reasoning_content') {
          return parsed[key];
        }
      }
    }
    
    // If parsed is just a string
    if (typeof parsed === 'string') {
      return parsed;
    }
  } catch {
    // Not JSON, treat as plain text - this is the normal case
  }
  
  return rawText;
}

// Remove ads and promotional content
function removeAds(text: string): string {
  const adPatterns = [
    /\[.*?pollinations.*?\]/gi,
    /pollinations\.ai/gi,
    /\[.*?sponsor.*?\]/gi,
    /\[.*?advertisement.*?\]/gi,
    /generated by pollinations/gi,
    /powered by pollinations/gi,
    /image generation.*?pollinations/gi,
    /https?:\/\/pollinations\.ai[^\s]*/gi,
    /https?:\/\/image\.pollinations\.ai[^\s]*/gi,
    /https?:\/\/text\.pollinations\.ai[^\s]*/gi,
    /^.*pollinations.*$/gim,
    /\n*note:?\s*this (response|answer|text).*$/gi,
    /\n*disclaimer:.*$/gi,
    /!\[.*?\]\(https?:\/\/.*?pollinations.*?\)/gi,
    /\n*---\n*generated.*$/gi,
    /\n*---\n*powered.*$/gi,
    /\*this (response|content|message) (was |is )?generated.*?\*/gi,
    /\(generated.*?\)/gi,
    /\[generated.*?\]/gi,
    // Remove JSON-like artifacts that might leak
    /\{"role":"assistant".*?\}/g,
    /"reasoning_content":"[^"]*"/g,
    /"tool_calls":\[\]/g,
  ];

  let cleaned = text;
  for (const pattern of adPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned.trim();
}

// Clean any LaTeX formatting
function cleanLatex(text: string): string {
  let t = text;
  
  // Remove \boxed{...}
  t = t.replace(/\\boxed\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '$1');
  
  // Remove \( ... \) inline math
  t = t.replace(/\\\(([^)]*(?:\([^)]*\)[^)]*)*)\\\)/g, '$1');
  
  // Remove \[ ... \] display math  
  t = t.replace(/\\\[([^\]]*(?:\[[^\]]*\][^\]]*)*)\\\]/g, '$1');
  
  // Remove \text{...}
  t = t.replace(/\\text\{([^}]*)\}/g, '$1');
  t = t.replace(/\\textbf\{([^}]*)\}/g, '**$1**');
  t = t.replace(/\\textit\{([^}]*)\}/g, '*$1*');
  t = t.replace(/\\mathrm\{([^}]*)\}/g, '$1');
  t = t.replace(/\\mathbf\{([^}]*)\}/g, '$1');
  
  // \frac{a}{b} -> (a/b)
  t = t.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)');
  
  // Math symbols
  t = t.replace(/\\times/g, 'x');
  t = t.replace(/\\div/g, '/');
  t = t.replace(/\\cdot/g, '*');
  t = t.replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)');
  t = t.replace(/\\pm/g, '+/-');
  t = t.replace(/\\neq/g, '!=');
  t = t.replace(/\\leq?/g, '<=');
  t = t.replace(/\\geq?/g, '>=');
  t = t.replace(/\\approx/g, '~=');
  t = t.replace(/\\infty/g, 'infinity');
  
  // Greek letters
  t = t.replace(/\\pi/g, 'pi');
  t = t.replace(/\\alpha/g, 'alpha');
  t = t.replace(/\\beta/g, 'beta');
  t = t.replace(/\\gamma/g, 'gamma');
  t = t.replace(/\\delta/g, 'delta');
  t = t.replace(/\\theta/g, 'theta');
  t = t.replace(/\\lambda/g, 'lambda');
  t = t.replace(/\\sigma/g, 'sigma');
  t = t.replace(/\\mu/g, 'mu');
  t = t.replace(/\\omega/g, 'omega');
  t = t.replace(/\\phi/g, 'phi');
  t = t.replace(/\\epsilon/g, 'epsilon');
  
  // Operators
  t = t.replace(/\\sum/g, 'SUM');
  t = t.replace(/\\prod/g, 'PRODUCT');
  t = t.replace(/\\int/g, 'INTEGRAL');
  t = t.replace(/\\partial/g, 'd');
  t = t.replace(/\\nabla/g, 'nabla');
  t = t.replace(/\\forall/g, 'for all');
  t = t.replace(/\\exists/g, 'exists');
  t = t.replace(/\\in\b/g, 'in');
  t = t.replace(/\\rightarrow/g, '->');
  t = t.replace(/\\leftarrow/g, '<-');
  t = t.replace(/\\Rightarrow/g, '=>');
  t = t.replace(/\\Leftarrow/g, '<=');
  
  // Remove \left \right
  t = t.replace(/\\left/g, '');
  t = t.replace(/\\right/g, '');
  
  // Remove spacing commands
  t = t.replace(/\\(quad|qquad|space|;|,|!|:)/g, ' ');
  
  // Remove \begin{...} and \end{...}
  t = t.replace(/\\begin\{[^}]*\}/g, '');
  t = t.replace(/\\end\{[^}]*\}/g, '');
  
  // Remove \\ (line breaks in LaTeX)
  t = t.replace(/\\\\/g, '\n');
  
  // Remove remaining backslash commands (catch-all) but NOT inside code blocks
  // First, protect code blocks
  const codeBlocks: string[] = [];
  t = t.replace(/(```[\s\S]*?```)/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });
  
  // Now remove remaining LaTeX commands outside code blocks
  t = t.replace(/\\[a-zA-Z]+/g, '');
  
  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    t = t.replace(`__CODE_BLOCK_${i}__`, block);
  });
  
  // Remove $...$ and $$...$$ math delimiters (but not inside code blocks)
  t = t.replace(/\$\$([^$]*)\$\$/g, '$1');
  t = t.replace(/\$([^$]*)\$/g, '$1');
  
  // Remove unnecessary braces
  t = t.replace(/\{(\d+[^}]*)\}/g, '$1');
  t = t.replace(/\{([a-zA-Z])\}/g, '$1');
  
  // Clean up multiple spaces
  t = t.replace(/ {3,}/g, '  ');
  
  return t;
}

function cleanResponse(rawText: string): string {
  // Step 1: Extract actual content from possible JSON wrapper
  let cleaned = extractContent(rawText);
  
  // Step 2: If it still looks like JSON, try harder
  if (cleaned.startsWith('{') && cleaned.includes('"role"')) {
    try {
      const obj = JSON.parse(cleaned);
      if (obj.content) cleaned = obj.content;
    } catch {
      // Remove JSON-like wrappers manually
      const contentMatch = cleaned.match(/"content"\s*:\s*"([\s\S]*?)(?:","|\"\})/);
      if (contentMatch) {
        cleaned = contentMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
    }
  }
  
  // Step 3: Remove ads
  cleaned = removeAds(cleaned);
  
  // Step 4: Clean LaTeX
  cleaned = cleanLatex(cleaned);
  
  // Step 5: Remove empty lines at start/end
  cleaned = cleaned.replace(/^\n+/, '').replace(/\n+$/, '');
  
  // Step 6: Normalize multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  
  // Check if asking about creator FIRST (instant response)
  const creatorResponse = isAskingAboutCreator(userMessage);
  if (creatorResponse) {
    return creatorResponse;
  }

  const systemPrompt = buildSystemPrompt();
  const recentHistory = conversationHistory.slice(-8);
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
  ];

  // Don't duplicate the user message if it's already the last one
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }

  // === ATTEMPT 1: POST with openai-large model ===
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'openai-large',
        seed: Math.floor(Math.random() * 100000),
        jsonMode: false,
      }),
    });

    if (response.ok) {
      const rawText = await response.text();
      const cleaned = cleanResponse(rawText);
      if (cleaned && cleaned.length > 2 && !cleaned.startsWith('{')) {
        return cleaned;
      }
    }
  } catch (err) {
    console.error('AI API Error (POST openai-large):', err);
  }

  // === ATTEMPT 2: GET endpoint with simpler format ===
  try {
    const encoded = encodeURIComponent(userMessage);
    const sysEncoded = encodeURIComponent(systemPrompt);
    const response = await fetch(
      `https://text.pollinations.ai/${encoded}?model=openai-large&system=${sysEncoded}&noCache=true`
    );
    
    if (response.ok) {
      const rawText = await response.text();
      const cleaned = cleanResponse(rawText);
      if (cleaned && cleaned.length > 2 && !cleaned.startsWith('{')) {
        return cleaned;
      }
    }
  } catch (err) {
    console.error('AI API Error (GET):', err);
  }

  // === ATTEMPT 3: POST with mistral model ===
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        model: 'mistral',
        seed: Math.floor(Math.random() * 100000),
      }),
    });

    if (response.ok) {
      const rawText = await response.text();
      const cleaned = cleanResponse(rawText);
      if (cleaned && cleaned.length > 2) {
        return cleaned;
      }
    }
  } catch {
    // ignore
  }

  // === ATTEMPT 4: GET with default model ===
  try {
    const encoded = encodeURIComponent(userMessage);
    const sysEncoded = encodeURIComponent("You are a helpful AI assistant. Answer clearly in the same language as the user. For math use plain text not LaTeX. For code use markdown code blocks.");
    const response = await fetch(
      `https://text.pollinations.ai/${encoded}?system=${sysEncoded}&noCache=true`
    );
    
    if (response.ok) {
      const rawText = await response.text();
      const cleaned = cleanResponse(rawText);
      if (cleaned && cleaned.length > 2) {
        return cleaned;
      }
    }
  } catch {
    // ignore
  }
  
  return 'Maaf, terjadi kesalahan koneksi ke server AI. Pastikan koneksi internet kamu stabil dan coba lagi. 🔄';
}
