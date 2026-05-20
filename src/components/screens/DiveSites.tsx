import { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Compass,
  Thermometer,
  CircleDot,
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Atoll, DiveSite } from '../../types';
import { useDiveSites } from '../../hooks/useDiveSites';
import { ATOLLS } from '../../constants';
import { motion, AnimatePresence } from 'motion/react';
import { DiveSiteMap } from '../dive-sites/DiveSiteMap';
import { DiveSiteForm } from '../dive-sites/DiveSiteForm';
import { DiveSiteMappingSection } from '../dive-sites/DiveSiteMappingSection';

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
    atoll: 'North Malé',
    difficulty: 'beginner',
    type: 'Reef',
    depthMin: 5,
    depthMax: 20,
    current: 'mild',
    marineLifeHighlights: [],
    isProtected: false,
    regulatedAccess: false
  });

  const filteredSites = allSites.filter(site => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = site.name.toLowerCase().includes(query) || 
                         site.atoll.toLowerCase().includes(query) ||
                         site.type.toLowerCase().includes(query) ||
                         site.marineLifeHighlights.some(life => life.toLowerCase().includes(query));
    const matchesAtoll = selectedAtoll === 'All' || site.atoll === selectedAtoll;
    return matchesSearch && matchesAtoll;
  });

  // Canonical 22-atoll list plus an "All" filter option — keeps the filter,
  // add-site form, and quick-select picker consistent.
  const atolls = ['All', ...ATOLLS] as const;

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
      atoll: 'North Malé',
      difficulty: 'beginner',
      type: 'Reef',
      depthMin: 5,
      depthMax: 20,
      current: 'mild',
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
          <p className="text-slate-500 text-sm">{allSites.length} curated Maldives dive sites with depth, season and GPS detail</p>
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
                  {site.visibility && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Eye className="w-4 h-4" /> {site.visibility}m vis.
                    </div>
                  )}
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
                        {site.coordinates && (
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Coordinates</label>
                            <p className="text-sm font-semibold text-maldives-deep">
                              {site.coordinates.lat.toFixed(3)}, {site.coordinates.lng.toFixed(3)}
                            </p>
                          </div>
                        )}
                        {site.protectedStatus && site.protectedStatus !== 'none' && (
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Status</label>
                            <p className="text-sm font-semibold text-maldives-deep">{site.protectedStatus}</p>
                          </div>
                        )}
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

                      {site.notes && (
                        <p className="mb-6 rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-relaxed text-slate-500">
                          {site.notes}
                        </p>
                      )}

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
          <DiveSiteForm
            newSite={newSite}
            setNewSite={setNewSite}
            onClose={() => setIsAddingSite(false)}
            onSave={handleSave}
            editing={!!editingSiteId}
          />
        )}
      </AnimatePresence>

      <DiveSiteMappingSection />
    </div>
  );
}
