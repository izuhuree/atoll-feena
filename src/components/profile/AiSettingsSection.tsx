import { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Save, Trash2 } from 'lucide-react';
import {
  clearStoredGeminiApiKey,
  getStoredGeminiApiKey,
  maskApiKey,
  saveStoredGeminiApiKey,
} from '../../lib/aiSettings';

export function AiSettingsSection() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedKey, setSavedKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredGeminiApiKey();
    setApiKey(stored);
    setSavedKey(stored);
  }, []);

  const saveKey = () => {
    saveStoredGeminiApiKey(apiKey);
    const stored = getStoredGeminiApiKey();
    setSavedKey(stored);
    setApiKey(stored);
    setMessage(stored ? 'Gemini API key saved on this device.' : 'Gemini API key removed.');
  };

  const clearKey = () => {
    clearStoredGeminiApiKey();
    setApiKey('');
    setSavedKey('');
    setMessage('Gemini API key removed from this device.');
  };

  return (
    <section>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">AI Settings</h3>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-maldives-lagoon/10 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-maldives-lagoon" />
          </div>
          <div>
            <p className="font-bold text-maldives-deep">Gemini API Key</p>
            <p className="text-xs leading-relaxed text-slate-500 mt-1">
              Used for trusted AI features such as dive-site sketch generation. Stored locally on this device only.
            </p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {maskApiKey(savedKey)}
            </p>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-slate-500">API Key</span>
          <div className="mt-1 flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
              className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey((value) => !value)}
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
              className="min-h-[44px] w-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>

        {message && <p className="text-xs font-semibold text-maldives-lagoon">{message}</p>}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={saveKey}
            className="min-h-[48px] bg-maldives-deep text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Key
          </button>
          <button
            onClick={clearKey}
            className="min-h-[48px] bg-slate-100 text-slate-600 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </section>
  );
}
