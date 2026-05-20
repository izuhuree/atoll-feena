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
  ShieldAlert,
  Leaf,
  Database,
  Anchor,
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
  const loggedSpeciesCount = new Set(dives.flatMap((dive) => dive.marineLife || [])).size;
  const reefRecordCount = dives.reduce(
    (total, dive) =>
      total + (dive.reefHealthObservations?.length || 0) + (dive.debrisObservations?.length || 0),
    0
  );

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
          className="col-span-2 bg-maldives-deep rounded-[2rem] p-7 flex flex-col justify-between shadow-lg shadow-maldives-deep/20 text-white min-h-[188px] relative overflow-hidden group text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
            <Waves className="w-24 h-24" />
          </div>
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2">
              Every dive counts
            </p>
            <h3 className="font-display font-bold text-2xl leading-tight max-w-[240px]">
              Log your dive. Improve the next one.
            </h3>
            <p className="text-white/80 text-xs mt-3 font-medium max-w-[260px]">
              Capture conditions, hazards, sightings and reef signals in one useful record.
            </p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate?.('sites')}
          aria-label="Open dive site conditions"
          className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[150px] text-left"
        >
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-maldives-deep leading-tight">
              Site Safety
            </h3>
            <p className="text-slate-500 text-xs mt-1">Recent conditions &amp; hazards</p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenGuide}
          aria-label="Open field guide"
          className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[150px] text-left"
        >
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-maldives-deep leading-tight">
              Reef Record
            </h3>
            <p className="text-slate-500 text-xs mt-1">Species, coral &amp; debris</p>
          </div>
        </motion.button>
      </div>

      {/* Quick counters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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
            <p className="text-2xl font-bold text-maldives-deep leading-none">Map</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Sites
            </p>
          </div>
        </button>
      </div>

      <section className="mb-10 grid grid-cols-3 gap-2">
        <button
          onClick={onOpenInsights}
          className="bg-white border border-slate-100 rounded-2xl p-3 min-h-[88px] text-left active:scale-[0.98] transition-transform"
        >
          <TrendingUp className="w-4 h-4 text-maldives-lagoon mb-2" />
          <p className="text-lg font-bold text-maldives-deep leading-none">{loggedSpeciesCount}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            Species
          </p>
        </button>
        <button
          onClick={onOpenInsights}
          className="bg-white border border-slate-100 rounded-2xl p-3 min-h-[88px] text-left active:scale-[0.98] transition-transform"
        >
          <Database className="w-4 h-4 text-emerald-600 mb-2" />
          <p className="text-lg font-bold text-maldives-deep leading-none">{reefRecordCount}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            Reef Signals
          </p>
        </button>
        <button
          onClick={() => onNavigate?.('sites')}
          className="bg-white border border-slate-100 rounded-2xl p-3 min-h-[88px] text-left active:scale-[0.98] transition-transform"
        >
          <Anchor className="w-4 h-4 text-amber-600 mb-2" />
          <p className="text-lg font-bold text-maldives-deep leading-none">
            {lastDive?.siteConditions?.hazards?.length || 0}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            Last Hazards
          </p>
        </button>
      </section>

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
            {lastDive.siteConditions && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-xl px-3 py-2">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Vis
                  </p>
                  <p className="text-xs font-bold text-maldives-deep">
                    {lastDive.siteConditions.visibilityMeters || '--'}m
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Current
                  </p>
                  <p className="text-xs font-bold text-maldives-deep capitalize">
                    {lastDive.siteConditions.current}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Surge
                  </p>
                  <p className="text-xs font-bold text-maldives-deep capitalize">
                    {lastDive.siteConditions.surge || '--'}
                  </p>
                </div>
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
              Start with one useful record: conditions for divers, observations for the reef.
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

      {/* Site Intelligence Preview */}
      <button
        onClick={() => onNavigate?.('sites')}
        className="block w-full mb-10 overflow-hidden relative rounded-3xl bg-white border border-slate-100 p-6 active:scale-[0.99] transition-transform text-left shadow-sm"
        aria-label="Explore Maldives dive sites"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon mb-2">
              Shared diver intelligence
            </p>
            <h3 className="text-maldives-deep font-display font-bold text-xl">
              Plan with better local knowledge
            </h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Browse Maldives sites with depth, current, season and protected-area context.
            </p>
          </div>
          <div className="w-12 h-12 bg-maldives-shallow/40 rounded-2xl flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-maldives-lagoon" />
          </div>
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
