import { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Compass, 
  Thermometer, 
  CircleDot,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Edit2,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Atoll, DiveSite } from '../../types';
import { useDiveSites } from '../../hooks/useDiveSites';
import { motion, AnimatePresence } from 'motion/react';
import { DiveSiteMap } from '../dive-sites/DiveSiteMap';

interface DiveSitesProps {
  onLogAtSite: (siteId: string) => void;
}

export function DiveSites({ onLogAtSite }: DiveSitesProps) {
  const { allSites, loading, saveSite, deleteSite } = useDiveSites();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtoll, setSelectedAtoll] = useState<Atoll | 'All'>('All');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
  const [newSite, setNewSite] = useState<Partial<DiveSite>>({
    atoll: 'North Male',
    difficulty: 'beginner',
    type: 'Reef',
    depthMin: 5,
    depthMax: 20,
    current: 'low',
    marineLifeHighlights: [],
    isProtected: false,
    regulatedAccess: false
  });

  const filteredSites = allSites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         site.atoll.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAtoll = selectedAtoll === 'All' || site.atoll === selectedAtoll;
    return matchesSearch && matchesAtoll;
  });

  const atolls = ['All', ...Array.from(new Set(allSites.map(s => s.atoll)))];

  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maldives-lagoon"></div>
      </div>
    );
  }

  const handleSave = () => {
    if (!newSite.name) return;
    const siteToSave: DiveSite = {
      id: editingSiteId || `custom-${Date.now()}`,
      name: newSite.name,
      atoll: newSite.atoll as Atoll,
      difficulty: newSite.difficulty as DiveSite['difficulty'],
      type: newSite.type as string,
      depthMin: newSite.depthMin as number,
      depthMax: newSite.depthMax as number,
      current: newSite.current as DiveSite['current'],
      description: newSite.description || '',
      marineLifeHighlights: newSite.marineLifeHighlights || [],
      bestSeason: newSite.bestSeason,
      isProtected: newSite.isProtected,
      regulatedAccess: newSite.regulatedAccess,
      ...newSite
    } as DiveSite;
    saveSite(siteToSave);
    setIsAddingSite(false);
    setEditingSiteId(null);
    setNewSite({
      atoll: 'North Male',
      difficulty: 'beginner',
      type: 'Reef',
      depthMin: 5,
      depthMax: 20,
      current: 'low',
      marineLifeHighlights: [],
      isProtected: false,
      regulatedAccess: false
    });
  };

  const startEditing = (site: DiveSite) => {
    setNewSite(site);
    setEditingSiteId(site.id);
    setIsAddingSite(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedSiteId(expandedSiteId === id ? null : id);
  };

  return (
    <div className="px-6 pt-12 pb-32">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 text-maldives-deep">Dive Sites</h1>
          <p className="text-slate-500 text-sm">Explore the best of Maldives underwater</p>
        </div>
        <button 
          onClick={() => setIsAddingSite(true)}
          className="w-12 h-12 bg-maldives-turquoise text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search sites, atolls..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-maldives-lagoon/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative">
          <select 
            className="w-full pl-4 pr-10 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-maldives-lagoon/20 appearance-none font-bold text-maldives-deep"
            value={selectedAtoll}
            onChange={(e) => {
              setSelectedAtoll(e.target.value as Atoll | 'All');
              setSelectedSiteId(null);
            }}
          >
            <option value="All">All Atolls</option>
            {atolls.filter(a => a !== 'All').map(atoll => (
              <option key={atoll} value={atoll}>{atoll}</option>
            ))}
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            className="w-full pl-4 pr-10 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-maldives-lagoon/20 appearance-none font-bold text-maldives-deep"
            value={selectedSiteId || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              setSelectedSiteId(val);
              if (val) setExpandedSiteId(val);
            }}
          >
            <option value="">Quick Select Dive Site...</option>
            {allSites.filter(s => selectedAtoll === 'All' || s.atoll === selectedAtoll).map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-maldives-lagoon w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-6">
        {filteredSites.filter(s => !selectedSiteId || s.id === selectedSiteId).map(site => {
          const isCustom = site.id.startsWith('custom-');
          const isExpanded = expandedSiteId === site.id;

          return (
            <motion.div 
              layout
              key={site.id} 
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300"
            >
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(site.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-display font-bold text-maldives-deep">{site.name}</h3>
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-maldives-lagoon" /> {site.atoll}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      site.difficulty === 'beginner' ? "bg-green-100 text-green-700" :
                      site.difficulty === 'intermediate' ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    )}>
                      {site.difficulty}
                    </span>
                    {isCustom && (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => startEditing(site)}
                          className="p-2 text-slate-300 hover:text-maldives-lagoon transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteSite(site.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className={cn(
                  "text-slate-600 text-sm leading-relaxed mb-4",
                  !isExpanded && "line-clamp-2"
                )}>
                  {site.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Compass className="w-4 h-4" /> {site.current}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Thermometer className="w-4 h-4" /> {site.depthMin}-{site.depthMax}m
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <CircleDot className="w-4 h-4" /> {site.type}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4 mb-6 pt-2 border-t border-slate-50">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Best Season</label>
                          <p className="text-sm font-semibold text-maldives-deep">{site.bestSeason || 'Year-round'}</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Island Base</label>
                          <p className="text-sm font-semibold text-maldives-deep">{site.islandBase}</p>
                        </div>
                      </div>

                      {/* Dive Profile Visual */}
                      <DiveSiteMap site={site} />

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {site.marineLifeHighlights.map(life => (
                          <span key={life} className="bg-maldives-lagoon/5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase text-maldives-lagoon">
                            {life}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLogAtSite(site.id);
                        }}
                        className="w-full py-4 bg-maldives-lagoon text-white rounded-2xl font-bold active:scale-[0.98] transition-transform shadow-lg shadow-maldives-shallow/50 mb-2"
                      >
                        Log Dive Here
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isExpanded && (
                  <div className="flex justify-center pt-2">
                    <div className="w-8 h-1 bg-slate-100 rounded-full" />
                  </div>
                )}
              </div>
              
              {(site.isProtected || isExpanded) && (
                <div className={cn(
                  "px-6 py-3 flex items-center justify-between transition-colors",
                  site.isProtected ? "bg-orange-50" : "bg-slate-50"
                )}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn("w-4 h-4", site.isProtected ? "text-orange-600" : "text-slate-400")} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      site.isProtected ? "text-orange-700" : "text-slate-500"
                    )}>
                      {site.isProtected ? "Protected Marine Area" : "Non-Protected Site"}
                    </span>
                  </div>
                  {site.regulatedAccess && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span className="text-[9px] font-bold uppercase text-red-700 tracking-wider">Permit Req.</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isAddingSite && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
            onClick={() => setIsAddingSite(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full rounded-t-[48px] max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-2 w-12 bg-slate-200 rounded-full mx-auto mt-4 mb-2 opacity-50" />
              
              <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-maldives-deep">
                    {editingSiteId ? 'Edit Dive Site' : 'Add New Dive Site'}
                  </h2>
                  <button onClick={() => setIsAddingSite(false)} className="p-2 text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Site Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Broken Rock"
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold"
                      value={newSite.name || ''}
                      onChange={e => setNewSite({ ...newSite, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Atoll</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold appearance-none"
                        value={newSite.atoll}
                        onChange={e => setNewSite({ ...newSite, atoll: e.target.value as Atoll })}
                      >
                        {atolls.filter(a => a !== 'All').map(atoll => (
                          <option key={atoll} value={atoll}>{atoll}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Difficulty</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold appearance-none"
                        value={newSite.difficulty}
                        onChange={e => setNewSite({ ...newSite, difficulty: e.target.value as DiveSite['difficulty'] })}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Type</label>
                      <input 
                        type="text"
                        placeholder="Reef, Thila, Wreck..."
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold"
                        value={newSite.type || ''}
                        onChange={e => setNewSite({ ...newSite, type: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Max Depth (m)</label>
                      <input 
                        type="number"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold"
                        value={newSite.depthMax || ''}
                        onChange={e => setNewSite({ ...newSite, depthMax: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Best Season</label>
                    <input 
                      type="text"
                      placeholder="e.g. Dec - May"
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold"
                      value={newSite.bestSeason || ''}
                      onChange={e => setNewSite({ ...newSite, bestSeason: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setNewSite({ ...newSite, isProtected: !newSite.isProtected })}
                      className={cn(
                        "flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest",
                        newSite.isProtected ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-slate-50 border-transparent text-slate-400"
                      )}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Protected
                    </button>
                    <button 
                      onClick={() => setNewSite({ ...newSite, regulatedAccess: !newSite.regulatedAccess })}
                      className={cn(
                        "flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest",
                        newSite.regulatedAccess ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 border-transparent text-slate-400"
                      )}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Regulated
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Description</label>
                    <textarea 
                      placeholder="Mention currents, unique features..."
                      className="w-full p-5 bg-slate-50 border-none rounded-2xl min-h-[100px] focus:ring-2 focus:ring-maldives-lagoon/20 font-medium"
                      value={newSite.description || ''}
                      onChange={e => setNewSite({ ...newSite, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 pb-12">
                <button 
                  onClick={handleSave}
                  disabled={!newSite.name}
                  className="w-full py-5 bg-maldives-deep text-white rounded-[24px] font-bold shadow-xl shadow-maldives-shallow/50 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  {editingSiteId ? 'Update Dive Site' : 'Save Dive Site'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
