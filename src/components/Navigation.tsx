import { 
  Home, 
  PlusCircle, 
  Map as MapIcon, 
  BookOpen, 
  BarChart3, 
  User,
  Watch
} from 'lucide-react';
import { cn } from '../lib/utils';

export type Tab = 'home' | 'quick-log' | 'sites' | 'logbook' | 'insights' | 'profile' | 'watch';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Navigation({ currentTab, onTabChange }: NavigationProps) {
  const tabs: Array<{ id: Tab; icon: any; label: string; primary?: boolean }> = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'sites', icon: MapIcon, label: 'Sites' },
    { id: 'quick-log', icon: PlusCircle, label: 'Log', primary: true },
    { id: 'logbook', icon: BookOpen, label: 'Logs' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-4 pb-safe pt-2 z-50">
      <div className="max-w-md mx-auto flex items-end justify-between">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all duration-300",
              tab.primary ? "relative" : "flex-1",
              currentTab === tab.id ? "text-maldives-lagoon" : "text-slate-400"
            )}
            id={`nav-tab-${tab.id}`}
          >
            {tab.primary ? (
              <div className="absolute -top-12 bg-maldives-deep p-4 rounded-full shadow-lg shadow-maldives-shallow/40 border-4 border-white active:scale-95 transition-transform">
                <tab.icon className="w-6 h-6 text-white" />
              </div>
            ) : (
              <>
                <tab.icon className={cn("w-5 h-5 mb-1 transition-transform", currentTab === tab.id && "scale-110")} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
              </>
            )}
            {tab.primary && <span className="text-[10px] font-medium uppercase tracking-wider mt-4">{tab.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}
