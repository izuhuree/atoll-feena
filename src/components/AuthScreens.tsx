import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { LogIn, ShieldCheck } from 'lucide-react';
import { db, friendlyAuthError, hasFirebaseConfig, signInGoogle } from '../lib/firebase';
import { Logo } from './Shell';

export function SignIn() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true); setError('');
    try { await signInGoogle(); } catch (e) { setError(friendlyAuthError(e)); } finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5">
    <section className="panel w-full max-w-md p-6">
      <div className="mb-6 flex items-center gap-3"><Logo /><div><h1 className="display text-2xl font-black text-sky-900">AtollFeeNa</h1><p className="text-sm font-semibold text-slate-600">Maldives scuba logbook and dive companion.</p></div></div>
      <button disabled={!hasFirebaseConfig || busy} onClick={go} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:bg-slate-400"><LogIn size={18} />{busy ? 'Opening Google...' : 'Continue with Google'}</button>
      {!hasFirebaseConfig && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Firebase config is missing. Add firebase-applet-config.json or VITE_FIREBASE_* variables.</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    </section>
  </main>;
}

export function SafetyModal({ uid, onDone }: { uid: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function agree() {
    if (!db) return;
    setBusy(true);
    await setDoc(doc(db, 'users', uid), { safetyAgreedAt: new Date().toISOString(), updatedAt: serverTimestamp() }, { merge: true });
    onDone();
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
    <section className="panel max-w-lg p-6">
      <div className="mb-4 flex items-center gap-3"><ShieldCheck className="text-cyan-600" /><h2 className="display text-2xl font-black text-sky-900">Dive Safety</h2></div>
      <p className="text-sm leading-6 text-slate-700">AtollFeeNa is a scuba logbook and planning companion. It is not a certified dive computer, decompression planner, emergency tool, or substitute for qualified dive training, local briefings, and professional judgment.</p>
      <button disabled={busy} onClick={agree} className="btn btn-primary mt-5 w-full">{busy ? 'Saving...' : 'I understand'}</button>
    </section>
  </div>;
}
