import { User } from 'firebase/auth';
import {
  Waves,
  Search,
  TrendingUp,
  Award,
  MapPin,
  Info,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useDives } from '../../hooks/useDives';

interface HomeProps {
  user: User | null;
  onLogDive: () => void;
  onOpenInsights: () => void;
  onOpenGuide: () => void;
  onNavigate?: (tab: string) => void;
}

/**
 * Home screen. Removed the secondary hamburger menu (was duplicating the
 * bottom tab bar) and replaced the dead-end empty state with a real CTA.
 */
export function Home({ user, onLogDive, onOpenInsights, onOpenGuide, onNavigate }: HomeProps) {
  const { dives } = useDives();
  const lastDive = dives[0];
  const firstName = user?.displayName?.split(' ')[0];

  return (
    <div className="px-6 pt-12 pb-24">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            src="/logo.png"
            alt="AtollFeeNa logo"
            className="w-11 h-11 rounded-2xl object-cover shadow-sm bg-white border border-slate-100 shrink-0"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Logo';
            }}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-maldives-turquoise uppercase tracking-widest leading-none">
              Maruhabaa{firstName ? `, ${firstName}` : ''}
            </p>
            <h1 className="text-2xl font-display font-bold text-maldives-deep tracking-tight truncate">
              AtollFeeNa
            </h1>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('user-guide')}
          aria-label="Open user guide"
          className="w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center text-maldives-deep active:scale-95 transition-transform"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </header>

      {/* Primary action + 2 secondary tiles */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onLogDive}
          aria-label="Log today's dive"
          className="col-span-2 bg-maldives-lagoon rounded-[2rem] p-7 flex flex-col justify-between shadow-lg shadow-maldives-lagoon/30 text-white min-h-[170px] relative overflow-hidden group text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
            <Waves className="w-24 h-24" />
          </div>
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl leading-tight">
              Log Today's
              <br />
              Adventure
            </h3>
            <p className="text-white/80 text-xs mt-2 font-medium">
              Record depth, time &amp; sightings
            </p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenGuide}
          aria-label="Open field guide"
          className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[150px] text-left"
        >
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-3">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-maldives-deep leading-tight">
              Field Guide
            </h3>
            <p className="text-slate-500 text-xs mt-1">Identify marine life</p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenInsights}
          aria-label="Open dive stats"
          className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[150px] text-left"
        >
          <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-maldives-deep leading-tight">
              Your Stats
            </h3>
            <p className="text-slate-500 text-xs mt-1">Trends &amp; performance</p>
          </div>
        </motion.button>
      </div>

      {/* Quick counters */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-50/70 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Award className="w-5 h-5 text-maldives-turquoise" />
          </div>
          <div>
            <p className="text-2xl font-bold text-maldives-deep leading-none">{dives.length}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Dives
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('sites')}
          className="bg-slate-50/70 rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
          aria-label="Browse dive sites"
        >
          <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <MapPin className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-maldives-deep leading-none">22</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Atolls
            </p>
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-maldives-deep">Last Dive</h2>
          {lastDive && (
            <button
              onClick={() => onNavigate?.('logbook')}
              className="text-maldives-lagoon text-sm font-semibold active:opacity-70"
            >
              View All
            </button>
          )}
        </div>
        {lastDive ? (
          <button
            onClick={() => onNavigate?.('logbook')}
            className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 pr-3">
                <h3 className="font-bold text-lg text-maldives-deep truncate">
                  {lastDive.customSiteName || 'Unknown Site'}
                </h3>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {lastDive.atoll}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-xl text-maldives-deep">{lastDive.maxDepth}m</p>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">
                  {lastDive.duration} min
                </p>
              </div>
            </div>
            {lastDive.marineLife.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lastDive.marineLife.slice(0, 3).map((life) => (
                  <span
                    key={life}
                    className="bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600"
                  >
                    {life}
                  </span>
                ))}
              </div>
            )}
          </button>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-maldives-shallow/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Waves className="text-maldives-lagoon w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-lg text-maldives-deep mb-1">
              Your logbook is empty
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Log your first dive to start tracking depth, sightings and progress.
            </p>
            <button
              onClick={onLogDive}
              className="inline-flex items-center gap-2 px-5 py-3 bg-maldives-deep text-white rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              <PlusCircle className="w-4 h-4" /> Log my first dive
            </button>
          </div>
        )}
      </section>

      {/* Maldives Map Preview */}
      <button
        onClick={() => onNavigate?.('sites')}
        className="block w-full mb-10 overflow-hidden relative rounded-3xl bg-slate-200 h-44 active:scale-[0.99] transition-transform"
        aria-label="Explore Maldives dive sites"
      >
        <img
          src="https://picsum.photos/seed/maldives-map/600/400"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-maldives-deep/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-6 text-center">
          <h3 className="text-white font-display font-bold text-xl drop-shadow-md">
            Explore Maldives
          </h3>
          <p className="text-white/90 text-sm drop-shadow-md">40+ dive sites mapped</p>
        </div>
      </button>

      <footer className="text-center pt-6">
        <a
          href="https://izuct.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium text-slate-400 tracking-widest hover:text-maldives-lagoon transition-colors inline-flex items-center gap-1.5"
        >
          <Info className="w-3 h-3" />© {new Date().getFullYear()} izuct.com
        </a>
      </footer>
    </div>
  );
}
