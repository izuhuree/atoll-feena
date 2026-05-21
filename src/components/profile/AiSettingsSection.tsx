import { useEffect, useState } from 'react';
import { KeyRound, Trash2 } from 'lucide-react';
import {
  clearStoredGeminiApiKey,
  getStoredGeminiApiKey,
} from '../../lib/aiSettings';

export function AiSettingsSection() {
  const [savedKey, setSavedKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSavedKey(getStoredGeminiApiKey());
  }, []);

  const clearKey = () => {
    clearStoredGeminiApiKey();
    setSavedKey('');
    setMessage('Old device key removed. Pro AI features use the admin-managed key.');
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
              Pro AI features use the admin-managed key in App Settings. This device key is no longer required.
            </p>
            {savedKey && (
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
                Old device key detected
              </p>
            )}
          </div>
        </div>

        {message && <p className="text-xs font-semibold text-maldives-lagoon">{message}</p>}

        {savedKey && (
          <button
            onClick={clearKey}
            className="min-h-[48px] w-full bg-slate-100 text-slate-600 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove Old Device Key
          </button>
        )}
      </div>
    </section>
  );
}
