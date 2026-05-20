import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Pencil } from 'lucide-react';
import type { DiveLog } from '../types';
import { saveDoc } from '../hooks/useFirebaseCollection';
import { Input } from './QuickLog';

export function Logbook({ logs }: { logs: DiveLog[] }) {
  const [open, setOpen] = useState<string>();
  const [edit, setEdit] = useState<DiveLog | null>(null);
  function exportCsv() {
    const rows = [['Dive #','Date','Site','Atoll','Depth','Duration','Rating'], ...logs.map((l) => [l.diveNumber, l.date, l.customSiteName || l.siteId || '', l.atoll, l.maxDepth, l.duration, l.rating || ''])];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `AtollFeeNa_Logs_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="display text-2xl font-black text-sky-900">Logbook</h1><button className="btn btn-soft" onClick={exportCsv}><Download size={17} />CSV</button></div>
    {!logs.length && <Empty />}
    {logs.map((log) => <article key={log.id} className="panel overflow-hidden">
      <button className="w-full p-4 text-left" onClick={() => setOpen(open === log.id ? undefined : log.id)}>
        <div className="flex justify-between gap-3"><div><p className="font-black text-sky-900">#{log.diveNumber} {log.customSiteName || log.siteId || 'Dive site'}</p><p className="text-sm text-slate-600">{fmt(log.date)} · {log.atoll}</p></div><div className="mono text-right text-sm font-black">{log.maxDepth}m<br />{log.duration}m</div></div>
      </button>
      {open === log.id && <div className="border-t border-slate-100 p-4 text-sm text-slate-700">
        <div className="grid gap-2 sm:grid-cols-2">{['current','gasType','startPressure','endPressure','sac','diveCenter','instructorName'].map((k) => <p key={k}><b>{k}:</b> {String((log as unknown as Record<string, unknown>)[k] ?? '-')}</p>)}</div>
        <p className="mt-3"><b>Marine life:</b> {(log.marineLife || []).join(', ') || '-'}</p><p><b>Buddies:</b> {(log.buddyNames || []).join(', ') || '-'}</p><p><b>Notes:</b> {log.notes || '-'}</p>
        <div className="mt-3 flex flex-wrap gap-2">{log.media?.map((m) => <a key={m.path} className="badge" href={m.url} target="_blank">{m.type}</a>)}</div>
        <button className="btn btn-soft mt-4" onClick={() => setEdit(log)}><Pencil size={16} />Edit</button>
      </div>}
    </article>)}
    {edit && <EditSheet log={edit} onClose={() => setEdit(null)} />}
  </div>;
}

function EditSheet({ log, onClose }: { log: DiveLog; onClose: () => void }) {
  const [draft, setDraft] = useState(log);
  async function save() { await saveDoc('diveLogs', log.id, draft as unknown as Record<string, unknown>); onClose(); }
  return <div className="fixed inset-0 z-40 grid place-items-end bg-slate-950/40 p-3"><section className="panel w-full max-w-xl p-5"><h2 className="display mb-3 text-xl font-black">Edit Dive</h2><div className="grid gap-3 sm:grid-cols-2"><Input label="Site" value={draft.customSiteName} onChange={(v) => setDraft({ ...draft, customSiteName: v })} /><Input label="Depth" type="number" value={draft.maxDepth} onChange={(v) => setDraft({ ...draft, maxDepth: Number(v) })} /><Input label="Duration" type="number" value={draft.duration} onChange={(v) => setDraft({ ...draft, duration: Number(v) })} /><Input label="Rating" type="number" value={draft.rating} onChange={(v) => setDraft({ ...draft, rating: Number(v) })} /></div><textarea className="input mt-3 min-h-24" value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /><div className="mt-4 flex gap-2"><button className="btn btn-soft flex-1" onClick={onClose}>Cancel</button><button className="btn btn-primary flex-1" onClick={save}>Save</button></div></section></div>;
}
function Empty() { return <div className="panel p-8 text-center text-slate-600"><p className="font-black">No dives yet</p><p className="text-sm">Use Quick Log to add your first AtollFeeNa entry.</p></div>; }
function fmt(date: string) { try { return format(new Date(date), 'dd MMM yyyy'); } catch { return date; } }
