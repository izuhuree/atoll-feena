import {
  Home,
  PlusCircle,
  Map as MapIcon,
  BookOpen,
  User,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type Tab =
  | 'home'
  | 'quick-log'
  | 'sites'
  | 'logbook'
  | 'insights'
  | 'profile'
  | 'watch'
  | 'field-guide'
  | 'user-guide';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

/**
 * Bottom tab bar. Flat 5-icon layout (no floating center button) so it never
 * collides with sticky CTAs on inner screens, and every touch target hits the
 * 44px minimum from AGENTS.md.
 */
export function Navigation({ currentTab, onTabChange }: NavigationProps) {
  const tabs: Array<{ id: Tab; icon: any; label: string }> = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'sites', icon: MapIcon, label: 'Sites' },
    { id: 'quick-log', icon: PlusCircle, label: 'Log' },
    { id: 'logbook', icon: BookOpen, label: 'Logs' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1 z-50"
    >
      <div className="max-w-md mx-auto flex items-stretch justify-between">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              id={`nav-tab-${tab.id}`}
              className={cn(
                'flex-1 min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-colors',
                isActive
                  ? 'text-maldives-lagoon'
                  : 'text-slate-400 active:text-maldives-deep'
              )}
            >
              <tab.icon
                className={cn(
                  'w-6 h-6 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span className="text-[10px] font-semibold tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
