import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';

type KbDoc = { id: string; name: string; status?: string; createdAt?: string };

export function KnowledgeBase() {
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [q, setQ] = useState('');
  const [result, setResult] = useState('');
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);
  async function load() { try { const res = await fetch('/api/kb/documents'); if (res.ok) setDocs(await res.json()); } catch { setDocs([]); } }
  async function upload() {
    if (!file) return;
    const init = await fetch('/api/kb/documents/initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }) });
    const data = await init.json();
    if (data.uploadUrl) await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    await fetch(`/api/kb/documents/${data.id}/upload-complete`, { method: 'POST' });
    await load();
  }
  async function search() { const res = await fetch('/api/kb/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) }); setResult(await res.text()); }
  return <div className="space-y-4"><h1 className="display text-2xl font-black text-sky-900">Knowledge Base</h1><section className="panel p-5"><label className="grid min-h-36 place-items-center rounded-3xl border-2 border-dashed border-cyan-200 bg-cyan-50 p-5 text-center"><Upload className="text-cyan-700" /><span className="font-black">Drop or choose PDF, DOCX, PNG, JPG, WEBP, TIFF</span><input className="mt-3" type="file" accept=".pdf,.docx,image/png,image/jpeg,image/webp,image/tiff" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><button className="btn btn-primary mt-3" disabled={!file} onClick={upload}>Upload and Process</button></section><section className="panel p-5"><h2 className="font-black">Documents</h2>{docs.map((d) => <details className="border-b py-3" key={d.id}><summary className="cursor-pointer font-bold">{d.name} <span className="badge">{d.status || 'queued'}</span></summary><div className="mt-3 flex gap-2"><button className="btn btn-soft" onClick={() => fetch(`/api/kb/documents/${d.id}/reprocess`, { method: 'POST' }).then(load)}>Reprocess</button><button className="btn btn-soft" onClick={() => fetch(`/api/kb/documents/${d.id}/status`).then((r) => r.text()).then(setResult)}>Status</button></div></details>)}</section><section className="panel p-5"><h2 className="font-black">Semantic Search</h2><div className="mt-3 flex gap-2"><input className="input" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn btn-primary" onClick={search}>Search</button></div>{result && <pre className="mt-3 overflow-auto rounded-2xl bg-slate-100 p-3 text-xs">{result}</pre>}</section><section className="panel p-5"><h2 className="font-black">Review Queue</h2><button className="btn btn-soft mt-3" onClick={() => fetch('/api/kb/proposed-updates').then((r) => r.text()).then(setResult)}>Load proposed updates</button></section></div>;
}

export function WatchPreview() {
  return <div className="grid place-items-center"><section className="rounded-[32px] border-8 border-slate-900 bg-slate-950 p-4 text-white shadow-2xl"><div className="h-72 w-56 rounded-[24px] bg-sky-950 p-4"><p className="text-xs font-black text-cyan-300">AtollFeeNa</p><h1 className="display mt-2 text-2xl font-black">Dive #42</h1><div className="mt-6 grid grid-cols-2 gap-3"><Tile k="Depth" v="18m" /><Tile k="Time" v="45m" /><Tile k="Gas" v="Air" /><Tile k="Stop" v="Yes" /></div><button className="mt-6 w-full rounded-full bg-cyan-400 py-3 text-sm font-black text-sky-950">Quick Log</button></div></section></div>;
}

export function UserGuide() {
  return <section className="panel p-5"><h1 className="display text-2xl font-black text-sky-900">User Guide</h1><div className="mt-4 space-y-3 text-sm leading-6 text-slate-700"><p><b>Log dives:</b> use Quick Log after each dive, add conditions, gas, sightings, media, and notes.</p><p><b>Plan with a team:</b> create a Team Dive, track checklist items and buddy pairs, then copy the completed plan to your personal logbook.</p><p><b>Use safety judgment:</b> AtollFeeNa records and supports planning, but certified dive computers, professional briefings, and training remain primary.</p><p><b>Admins:</b> sync Storage reference JSON files and review Knowledge Base proposals before publishing site or species data.</p></div></section>;
}
function Tile({ k, v }: { k: string; v: string }) { return <div className="rounded-2xl bg-white/10 p-3"><p className="text-[10px] font-black uppercase text-cyan-200">{k}</p><p className="mono text-xl font-black">{v}</p></div>; }
