import { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Waves, 
  Search, 
  TrendingUp, 
  Award, 
  MapPin, 
  ChevronRight,
  Info,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDives } from '../../hooks/useDives';

interface HomeProps {
  user: User | null;
  onLogDive: () => void;
  onOpenInsights: () => void;
  onOpenGuide: () => void;
  onNavigate?: (tab: string) => void;
}

export function Home({ user, onLogDive, onOpenInsights, onOpenGuide, onNavigate }: HomeProps) {
  const { dives } = useDives();
  const lastDive = dives[0];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="px-6 pt-12 pb-24">
      <header className="mb-10 flex items-center justify-between relative">
        <div className="flex items-center gap-2.5">
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            src="/logo.png" 
            alt="AtollFeeNa Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] object-cover shadow-sm bg-white border border-slate-100"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Logo';
            }}
          />
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[26px] sm:text-3xl font-display font-bold text-maldives-deep tracking-tight whitespace-nowrap"
          >
            AtollFeeNa <span className="text-slate-300 font-light underline decoration-maldives-lagoon/20 underline-offset-8">Log</span>
          </motion.h1>
        </div>
        
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-maldives-deep z-20"
        >
          {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-14 right-0 w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-6 z-30 border border-slate-100"
            >
              <h3 className="font-bold text-lg text-maldives-deep mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-maldives-lagoon" /> 
                About AtollFeeNa
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                AtollFeeNa is a premier diving logbook tailored for the Maldives. Record your dives, track marine life, and browse detailed topographical maps of local dive sites.
              </p>
              
              <h4 className="font-bold text-sm text-maldives-deep mt-6 mb-3 uppercase tracking-wider">Quick Links</h4>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => { setShowMenu(false); onNavigate?.('user-guide'); }}
                  className="text-left text-sm text-slate-700 hover:text-maldives-lagoon hover:bg-slate-50 font-medium py-2 px-3 rounded-xl transition-colors"
                >
                  User Guide
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onNavigate?.('sites'); }}
                  className="text-left text-sm text-slate-700 hover:text-maldives-lagoon hover:bg-slate-50 font-medium py-2 px-3 rounded-xl transition-colors"
                >
                  Explore Dive Sites
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onNavigate?.('quick-log'); }}
                  className="text-left text-sm text-slate-700 hover:text-maldives-lagoon hover:bg-slate-50 font-medium py-2 px-3 rounded-xl transition-colors"
                >
                  Log a Dive
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onNavigate?.('logbook'); }}
                  className="text-left text-sm text-slate-700 hover:text-maldives-lagoon hover:bg-slate-50 font-medium py-2 px-3 rounded-xl transition-colors"
                >
                  View Logbook
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onNavigate?.('profile'); }}
                  className="text-left text-sm text-slate-700 hover:text-maldives-lagoon hover:bg-slate-50 font-medium py-2 px-3 rounded-xl transition-colors"
                >
                  My Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Actions - Bento Style */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={onLogDive}
          className="col-span-2 bg-maldives-lagoon rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg shadow-maldives-lagoon/30 text-white min-h-[180px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
            <Waves className="w-24 h-24" />
          </div>
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl leading-tight">Log Today's<br />Adventure</h3>
            <p className="text-white/70 text-xs mt-2 font-medium">Record depth, time & sightings</p>
          </div>
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={onOpenGuide}
          className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between min-h-[160px] group"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-maldives-deep leading-tight">Field<br />Guide</h3>
            <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Encyclopedia</p>
          </div>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={onOpenInsights}
          className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between min-h-[160px] group"
        >
           <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-maldives-deep leading-tight">Your<br />Stats</h3>
            <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Performance</p>
          </div>
        </motion.button>
      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-50/50 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Award className="w-5 h-5 text-maldives-turquoise" />
          </div>
          <div>
            <p className="text-2xl font-bold text-maldives-deep leading-none">{dives.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dives</p>
          </div>
        </div>
        <div className="bg-slate-50/50 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <MapPin className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-maldives-deep leading-none">14</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Atolls</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">Last Dive</h2>
          <button className="text-maldives-lagoon text-sm font-semibold">View All</button>
        </div>
        {lastDive ? (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{lastDive.customSiteName || 'Unknown Site'}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {lastDive.atoll}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">{lastDive.maxDepth}m</p>
                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">{lastDive.duration} min</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {lastDive.marineLife.slice(0, 3).map(life => (
                <span key={life} className="bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600">
                  {life}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="text-slate-300 w-8 h-8" />
            </div>
            <p className="text-slate-400 text-sm">No dives logged yet. Get in the water!</p>
          </div>
        )}
      </section>

      {/* Maldives Map Preview */}
      <section className="mb-10 overflow-hidden relative rounded-3xl bg-slate-200 h-48 flex items-center justify-center">
        <img 
          src="https://picsum.photos/seed/maldives-map/600/400" 
          alt="Maldives Map" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center">
          <h3 className="text-white font-bold text-xl drop-shadow-md">Explore Maldives</h3>
          <p className="text-white/80 text-sm drop-shadow-md">40+ Dive Sites Discovered</p>
        </div>
      </section>

      <footer className="mt-8 pb-12 text-center border-t border-slate-100 pt-8">
        <a 
          href="https://izuct.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-maldives-lagoon transition-colors inline-flex items-center gap-1.5"
        >
          © {new Date().getFullYear()} izuct.com
        </a>
      </footer>
    </div>
  );
}
