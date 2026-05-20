import { useState } from 'react';
import type { ReactNode } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { Save } from 'lucide-react';
import type { DiveLog, DiveSite, Species } from '../types';
import { atolls } from '../lib/reference';
import { saveDoc } from '../hooks/useFirebaseCollection';
import { uploadUserFile } from '../hooks/useUpload';

export function QuickLog({ uid, logs, sites, species, onDone }: { uid: string; logs: DiveLog[]; sites: DiveSite[]; species: Species[]; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState<File[]>([]);
  const [form, setForm] = useState<Partial<DiveLog>>({ date: new Date().toISOString().slice(0, 10), atoll: 'North Male', gasType: 'air', oxygenPercent: 21, tankSize: 12, entryType: 'boat', safetyStop: true, duration: 45, maxDepth: 18, current: 'mild', rating: 4, marineLife: [] });
  const siteName = form.customSiteName || sites.find((s) => s.id === form.siteId)?.name;
  const sac = form.startPressure && form.endPressure && form.duration && form.maxDepth && form.tankSize ? Math.round((((form.startPressure - form.endPressure) * form.tankSize) / form.duration / ((form.maxDepth / 10) + 1)) * 10) / 10 : undefined;
  async function submit() {
    if (!siteName) return;
    setBusy(true);
    const uploaded = await Promise.all(media.map(async (file) => {
      const item = await uploadUserFile(uid, 'dive-media', file);
      return { ...item, type: file.type.startsWith('video') ? 'video' : 'image' } as const;
    }));
    await saveDoc('diveLogs', undefined, { ...form, id: '', userId: uid, diveNumber: Math.max(0, ...logs.map((l) => l.diveNumber || 0)) + 1, atoll: form.atoll || 'North Male', gasType: form.gasType || 'air', oxygenPercent: form.oxygenPercent || 21, tankSize: form.tankSize || 12, entryType: form.entryType || 'boat', safetyStop: form.safetyStop ?? true, sac, media: uploaded, syncStatus: 'synced', createdAt: serverTimestamp() });
    onDone();
  }
  return <section className="panel p-5">
    <div className="mb-4 flex items-center justify-between"><h1 className="display text-2xl font-black text-sky-900">Quick Log</h1><span className="badge">Step {step}/6</span></div>
    {step === 1 && <Grid><Select label="Dive site" value={form.siteId || ''} onChange={(v) => setForm({ ...form, siteId: v, customSiteName: '' })} options={['', ...sites.map((s) => s.id)]} names={{ '': 'Choose site', ...Object.fromEntries(sites.map((s) => [s.id, s.name])) }} /><Input label="Custom site" value={form.customSiteName} onChange={(v) => setForm({ ...form, customSiteName: v })} /><Input label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /><Select label="Atoll" value={form.atoll || ''} onChange={(v) => setForm({ ...form, atoll: v })} options={atolls} /><Input label="Island" value={form.island} onChange={(v) => setForm({ ...form, island: v })} /></Grid>}
    {step === 2 && <Grid><Input label="Max depth (m)" type="number" value={form.maxDepth} onChange={(v) => setForm({ ...form, maxDepth: Number(v) })} /><Input label="Duration (min)" type="number" value={form.duration} onChange={(v) => setForm({ ...form, duration: Number(v) })} /><Input label="Start time" type="time" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} /><Input label="Visibility (m)" type="number" value={form.visibility} onChange={(v) => setForm({ ...form, visibility: Number(v) })} /><Select label="Current" value={form.current || 'unknown'} onChange={(v) => setForm({ ...form, current: v as DiveLog['current'] })} options={['none','mild','moderate','strong','very strong','unknown']} /></Grid>}
    {step === 3 && <Grid><Input label="Gas" value={form.gasType} onChange={(v) => setForm({ ...form, gasType: v })} /><Input label="O2 %" type="number" value={form.oxygenPercent} onChange={(v) => setForm({ ...form, oxygenPercent: Number(v) })} /><Input label="Tank L" type="number" value={form.tankSize} onChange={(v) => setForm({ ...form, tankSize: Number(v) })} /><Input label="Start bar" type="number" value={form.startPressure} onChange={(v) => setForm({ ...form, startPressure: Number(v) })} /><Input label="End bar" type="number" value={form.endPressure} onChange={(v) => setForm({ ...form, endPressure: Number(v) })} /><div className="rounded-2xl bg-cyan-50 p-3"><p className="label">SAC</p><p className="mono text-xl font-black">{sac || '-'} L/min</p></div></Grid>}
    {step === 4 && <Grid>{species.map((s) => <label key={s.id} className="flex items-center gap-2 rounded-2xl border p-3 text-sm font-bold"><input type="checkbox" checked={form.marineLife?.includes(s.name)} onChange={(e) => setForm({ ...form, marineLife: e.target.checked ? [...(form.marineLife || []), s.name] : form.marineLife?.filter((x) => x !== s.name) })} />{s.name}</label>)}</Grid>}
    {step === 5 && <div><label className="label">Images or video</label><input className="input" type="file" multiple accept="image/*,video/*" onChange={(e) => setMedia([...e.target.files || []])} /><p className="mt-2 text-sm text-slate-500">{media.length} selected</p></div>}
    {step === 6 && <div className="space-y-3 text-sm"><p><b>{siteName || 'Site required'}</b> · {form.atoll} · {form.date}</p><p>{form.maxDepth}m for {form.duration} min · {form.gasType} {form.oxygenPercent}% · SAC {sac || '-'}</p><Input label="Buddies" value={form.buddyNames?.join(', ')} onChange={(v) => setForm({ ...form, buddyNames: v.split(',').map((x) => x.trim()).filter(Boolean) })} /><Input label="Dive center" value={form.diveCenter} onChange={(v) => setForm({ ...form, diveCenter: v })} /><textarea className="input min-h-28" placeholder="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>}
    <div className="mt-5 flex gap-2"><button className="btn btn-soft flex-1" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>{step < 6 ? <button className="btn btn-primary flex-1" disabled={step === 1 && !siteName} onClick={() => setStep(step + 1)}>Next</button> : <button className="btn btn-primary flex-1" disabled={busy || !siteName} onClick={submit}><Save size={18} />Save Dive</button>}</div>
  </section>;
}

export function Input({ label, value, onChange, type = 'text' }: { label: string; value?: string | number; onChange: (v: string) => void; type?: string }) { return <label><span className="label">{label}</span><input className="input" type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></label>; }
export function Select({ label, value, onChange, options, names = {} }: { label: string; value: string; onChange: (v: string) => void; options: string[]; names?: Record<string, string> }) { return <label><span className="label">{label}</span><select className="input" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{names[o] || o}</option>)}</select></label>; }
function Grid({ children }: { children: ReactNode }) { return <div className="grid gap-3 sm:grid-cols-2">{children}</div>; }
