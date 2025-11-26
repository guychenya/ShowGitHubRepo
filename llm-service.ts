import { GoogleGenAI } from "@google/genai";

export type LLMProvider = 'gemini' | 'groq' | 'openai';

interface LLMResponse {
  text: string;
}

// Runtime API keys (from localStorage) - initialized lazily
let runtimeKeys: { gemini?: string; groq?: string; openai?: string } = {};

// Initialize keys from localStorage safely
const initializeKeys = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    runtimeKeys = {
      gemini: localStorage.getItem('GEMINI_API_KEY') || undefined,
      groq: localStorage.getItem('GROQ_API_KEY') || undefined,
      openai: localStorage.getItem('OPENAI_API_KEY') || undefined
    };
  }
};

// Initialize on first access
initializeKeys();

export const setApiKeys = (keys: { gemini?: string; groq?: string; openai?: string }) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.error('localStorage is not available');
    return;
  }

  if (keys.gemini && keys.gemini.trim()) {
    localStorage.setItem('GEMINI_API_KEY', keys.gemini.trim());
    runtimeKeys.gemini = keys.gemini.trim();
  } else {
    localStorage.removeItem('GEMINI_API_KEY');
    runtimeKeys.gemini = undefined;
  }
  
  if (keys.groq && keys.groq.trim()) {
    localStorage.setItem('GROQ_API_KEY', keys.groq.trim());
    runtimeKeys.groq = keys.groq.trim();
  } else {
    localStorage.removeItem('GROQ_API_KEY');
    runtimeKeys.groq = undefined;
  }
  
  if (keys.openai && keys.openai.trim()) {
    localStorage.setItem('OPENAI_API_KEY', keys.openai.trim());
    runtimeKeys.openai = keys.openai.trim();
  } else {
    localStorage.removeItem('OPENAI_API_KEY');
    runtimeKeys.openai = undefined;
  }
};

export const getApiKeys = () => {
  // Reinitialize from localStorage if keys are empty
  if (!runtimeKeys.gemini && !runtimeKeys.groq && !runtimeKeys.openai) {
    initializeKeys();
  }
  return { ...runtimeKeys };
};

const getApiKey = (provider: LLMProvider): string | undefined => {
  // Reinitialize from localStorage if all keys are empty
  if (!runtimeKeys.gemini && !runtimeKeys.groq && !runtimeKeys.openai) {
    initializeKeys();
  }
  
  // Check runtime keys first (from localStorage), then env vars
  switch (provider) {
    case 'gemini':
      return runtimeKeys.gemini || process.env.GEMINI_API_KEY;
    case 'groq':
      return runtimeKeys.groq || process.env.GROQ_API_KEY;
    case 'openai':
      return runtimeKeys.openai || process.env.OPENAI_API_KEY;
  }
};

const getAvailableProvider = (): { provider: LLMProvider; apiKey: string } | null => {
  const geminiKey = getApiKey('gemini');
  if (geminiKey) return { provider: 'gemini', apiKey: geminiKey };
  
  const groqKey = getApiKey('groq');
  if (groqKey) return { provider: 'groq', apiKey: groqKey };
  
  const openaiKey = getApiKey('openai');
  if (openaiKey) return { provider: 'openai', apiKey: openaiKey };
  
  return null;
};

const callGemini = async (prompt: string, apiKey: string, schema?: any): Promise<LLMResponse> => {
  const ai = new GoogleGenAI({ apiKey });
  const config: any = { responseMimeType: "application/json" };
  if (schema) config.responseSchema = schema;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config
  });
  return { text: response.text };
};

const callGroq = async (prompt: string, apiKey: string): Promise<LLMResponse> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt + '\n\nReturn ONLY valid JSON.' }],
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return { text: data.choices[0].message.content };
};

const callOpenAI = async (prompt: string, apiKey: string): Promise<LLMResponse> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt + '\n\nReturn ONLY valid JSON.' }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return { text: data.choices[0].message.content };
};

export const generateContent = async (prompt: string, schema?: any): Promise<string> => {
  const config = getAvailableProvider();
  if (!config) throw new Error("No API key configured. Please configure at least one API key in settings.");
  
  const { provider, apiKey } = config;
  
  try {
    let response: LLMResponse;
    switch (provider) {
      case 'gemini':
        response = await callGemini(prompt, apiKey, schema);
        break;
      case 'groq':
        response = await callGroq(prompt, apiKey);
        break;
      case 'openai':
        response = await callOpenAI(prompt, apiKey);
        break;
    }
    return response.text;
  } catch (error) {
    throw new Error(`${provider} API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getActiveProvider = (): LLMProvider | null => {
  const config = getAvailableProvider();
  return config?.provider || null;
};
