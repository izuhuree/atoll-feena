const GEMINI_KEY_STORAGE = 'atollfeena.geminiApiKey';

export function getStoredGeminiApiKey() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function saveStoredGeminiApiKey(apiKey: string) {
  if (typeof window === 'undefined') return;
  const trimmed = apiKey.trim();
  if (trimmed) {
    window.localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
  } else {
    window.localStorage.removeItem(GEMINI_KEY_STORAGE);
  }
}

export function clearStoredGeminiApiKey() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(GEMINI_KEY_STORAGE);
}

export function getGeminiApiKey() {
  const buildKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (buildKey && buildKey !== 'MY_GEMINI_API_KEY') return buildKey;
  return getStoredGeminiApiKey();
}

export function getConfiguredGeminiApiKey(adminKey?: string) {
  const buildKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (buildKey && buildKey !== 'MY_GEMINI_API_KEY') return buildKey;
  if (adminKey?.trim()) return adminKey.trim();
  return getStoredGeminiApiKey();
}

export function maskApiKey(apiKey: string) {
  if (!apiKey) return 'Not configured';
  if (apiKey.length <= 10) return 'Saved';
  return `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;
}
