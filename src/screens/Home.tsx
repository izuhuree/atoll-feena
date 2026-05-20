import { BarChart3, BookOpen, Fish, Map, Users } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { DiveLog, Tab } from '../types';

export function Home({ logs, setTab }: { logs: DiveLog[]; setTab: (tab: Tab) => void }) {
  const latest = logs[0];
  const atolls = new Set(logs.map((l) => l.atoll).filter(Boolean)).size;
  return <div className="space-y-5">
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-black text-cyan-700">AtollFeeNa Log</p><h1 className="display text-3xl font-black text-sky-950">Maruhabaa</h1><p className="mt-1 text-sm text-slate-600">Track dives, species, teams, and Maldives sites.</p></div>
        <button className="btn btn-soft" onClick={() => setTab('guide')}>About</button>
      </div>
      <button className="btn btn-primary mt-5 w-full" onClick={() => setTab('quick')}>Log Today's Adventure</button>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Action icon={<Fish />} label="Species" onClick={() => setTab('species')} />
        <Action icon={<BarChart3 />} label="Analytics" onClick={() => setTab('insights')} />
        <Action icon={<Users />} label="Team" onClick={() => setTab('team')} />
      </div>
    </motion.section>
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat label="Total dives" value={logs.length} /><Stat label="Atolls" value={atolls} /><Stat label="Bottom time" value={`${logs.reduce((a, l) => a + Number(l.duration || 0), 0)}m`} />
    </div>
    <section className="grid gap-4 md:grid-cols-2">
      <div className="panel p-5"><h2 className="display mb-3 text-xl font-black text-sky-900">Latest Dive</h2>{latest ? <div className="text-sm text-slate-700"><p className="font-black">{latest.customSiteName || latest.siteId} · {latest.atoll}</p><p>{format(new Date(latest.date), 'dd MMM yyyy')} · {latest.maxDepth}m · {latest.duration} min</p></div> : <p className="text-sm text-slate-500">No dives yet. Your first log starts here.</p>}<button className="btn btn-soft mt-4" onClick={() => setTab('logbook')}><BookOpen size={17} />Logbook</button></div>
      <div className="panel min-h-56 overflow-hidden bg-cyan-50 p-5"><div className="flex items-center gap-2 text-sky-900"><Map /><h2 className="display text-xl font-black">Maldives Map</h2></div><div className="mt-6 grid grid-cols-3 gap-3">{['Baa','Ari','Male','Vaavu','Laamu','Addu'].map((a, i) => <div key={a} className="rounded-full bg-white p-3 text-center text-xs font-black text-cyan-800 shadow" style={{ transform: `translateY(${i % 2 ? 18 : 0}px)` }}>{a}</div>)}</div></div>
    </section>
  </div>;
}

function Action({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) { return <button onClick={onClick} className="touch rounded-2xl border border-sky-100 bg-sky-50 p-3 text-xs font-black text-sky-900">{icon}<span>{label}</span></button>; }
function Stat({ label, value }: { label: string; value: string | number }) { return <div className="panel p-4"><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mono text-2xl font-black text-sky-900">{value}</p></div>; }
