import { BarChart3, BookOpen, Compass, Home, LogOut, Plus, Settings, Shield, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tab } from '../types';
import { logout } from '../lib/firebase';

type Props = { tab: Tab; setTab: (tab: Tab) => void; isAdmin: boolean; canUseKb: boolean; children: ReactNode };

export function Shell({ tab, setTab, isAdmin, canUseKb, children }: Props) {
  const profileTab: Tab = isAdmin ? 'settings' : 'profile';
  const nav = [
    ['home', Home, 'Home'], ['sites', Compass, 'Sites'], ['quick', Plus, 'Quick Log'],
    ['team', Users, 'Team'], ['logbook', BookOpen, 'Logbook'], [profileTab, isAdmin ? Settings : Shield, isAdmin ? 'Settings' : 'Profile']
  ] as const;
  return <div className="min-h-screen bg-slate-50 pb-28">
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <button onClick={() => setTab('home')} className="flex items-center gap-3 text-left">
          <Logo /><div><p className="display text-lg font-black text-sky-900">AtollFeeNa</p><p className="text-xs font-bold text-cyan-700">Maruhabaa, diver</p></div>
        </button>
        <div className="flex gap-2">
          <button className="btn btn-soft" onClick={() => setTab('insights')} title="Insights"><BarChart3 size={18} /></button>
          {canUseKb && <button className="btn btn-soft" onClick={() => setTab('kb')} title="Knowledge Base">KB</button>}
          <button className="btn btn-soft" onClick={logout} title="Log out"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
    <nav className="fixed inset-x-3 bottom-3 z-30 mx-auto grid max-w-lg grid-cols-6 rounded-full border border-white/70 bg-white/85 p-2 shadow-2xl backdrop-blur">
      {nav.map(([key, Icon, label]) => <button key={key} onClick={() => setTab(key)} className={`touch flex flex-col items-center justify-center gap-1 rounded-full text-[10px] font-black ${tab === key ? 'bg-sky-900 text-white' : 'text-slate-600'}`}>
        <Icon size={key === 'quick' ? 22 : 18} /><span className={key === 'quick' ? 'sr-only' : ''}>{label}</span>
      </button>)}
    </nav>
  </div>;
}

export function Logo() {
  return <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-900 text-white shadow-lg shadow-cyan-900/20">
    <Compass size={24} />
  </div>;
}
