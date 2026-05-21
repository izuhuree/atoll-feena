import { ReactNode, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { Atoll, DiveSite } from '../../types';
import { useAtolls } from '../../hooks/useAtolls';
import { useDiveSiteSuggestions } from '../../hooks/useDiveSiteSuggestions';
import { useDiveSiteMutations } from '../../hooks/useDiveSiteMutations';
import { useFilteredDiveSites } from '../../hooks/useFilteredDiveSites';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useUserRole } from '../../hooks/useUserRole';
import { AnimatePresence } from 'motion/react';
import { DiveSiteForm } from '../dive-sites/DiveSiteForm';
import { DiveSiteMappingSection } from '../dive-sites/DiveSiteMappingSection';
import { DiveSiteCard } from '../dive-sites/DiveSiteCard';

interface DiveSitesProps {
  user: User | null;
  onLogAtSite: (siteId: string) => void;
}

export function DiveSites({ user, onLogAtSite }: DiveSitesProps) {
  const { saveSite, deleteSite } = useDiveSiteMutations();
  const { submitSuggestion } = useDiveSiteSuggestions();
  const { canPublishDiveSiteInfo, canEditSketchInstructions } = useUserRole(user);
  const { atolls } = useAtolls();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtoll, setSelectedAtoll] = useState<Atoll | 'All'>('All');
  const [islandTerm, setIslandTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const debouncedIslandTerm = useDebouncedValue(islandTerm);
  const {
    sites: filteredSites,
    loading,
    loadingMore,
    hasMore,
    hasFilter,
    error,
    loadMore,
  } = useFilteredDiveSites({
    atoll: selectedAtoll,
    islandSearch: debouncedIslandTerm,
    siteSearch: debouncedSearchTerm,
  });
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
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

  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  const groupedSites = useMemo(() => {
    return filteredSites.reduce<Record<string, DiveSite[]>>((groups, site) => {
      const letter = site.name[0]?.toUpperCase().match(/[A-Z]/) ? site.name[0].toUpperCase() : '#';
      groups[letter] = [...(groups[letter] || []), site];
      return groups;
    }, {});
  }, [filteredSites]);

  const siteStats = useMemo(() => {
    const atollCount = new Set(filteredSites.map((site) => site.atoll).filter(Boolean)).size;
    const islandCount = new Set(filteredSites.map((site) => site.islandBase).filter(Boolean)).size;
    return [
      { label: 'Loaded', value: filteredSites.length },
      { label: 'Atolls', value: atollCount },
      { label: 'Islands', value: islandCount },
      { label: 'Mapped', value: filteredSites.filter((site) => site.coordinates).length },
      { label: 'Protected', value: filteredSites.filter((site) => site.isProtected).length },
      {
        label: 'Stronger Current',
        value: filteredSites.filter((site) => site.current === 'strong' || site.current === 'very strong').length,
      },
    ];
  }, [filteredSites]);

  const activeFilterCount = [
    searchTerm.trim(),
    selectedAtoll !== 'All',
    islandTerm.trim(),
  ].filter(Boolean).length;

  const handleSave = async () => {
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
      sketchInstructions: newSite.sketchInstructions || newSite.description || '',
      sketchInstructionsUpdatedAt: newSite.sketchInstructionsUpdatedAt,
      marineLifeHighlights: newSite.marineLifeHighlights || [],
      bestSeason: newSite.bestSeason,
      isProtected: newSite.isProtected,
      regulatedAccess: newSite.regulatedAccess,
      ...newSite
    } as DiveSite;
    if (canPublishDiveSiteInfo) {
      await saveSite(siteToSave);
      setSaveNotice('Dive site updated.');
    } else {
      await submitSuggestion(
        {
          id: siteToSave.id,
          name: siteToSave.name,
          atoll: siteToSave.atoll,
          description: siteToSave.description,
        },
        editingSiteId || undefined
      );
      setSaveNotice('Suggestion submitted for review.');
    }
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

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAtoll('All');
    setIslandTerm('');
    setExpandedSiteId(null);
  };

  return (
    <div className="px-4 pt-10 pb-32 sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-7xl justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 text-maldives-deep">Dive Sites</h1>
          <p className="text-slate-500 text-sm">
            Select an atoll, island, or site name to load matching dive sites
          </p>
          {saveNotice && (
            <p className="mt-2 text-xs font-bold text-maldives-lagoon">{saveNotice}</p>
          )}
        </div>
        <button 
          onClick={() => setIsAddingSite(true)}
          className="w-12 h-12 bg-maldives-turquoise text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="mx-auto max-w-7xl">
        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {siteStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                <p className="font-display text-lg font-bold text-maldives-deep">{stat.value}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
          {!hasFilter && (
            <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
              Stats update after you choose an atoll, island, or site name.
            </p>
          )}
        </section>

        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search dive site name"
              className="w-full min-h-[52px] pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-maldives-lagoon/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              id="atoll-filter"
              label="Atoll"
              icon={<Filter className="w-4 h-4" />}
              value={selectedAtoll}
              onChange={(value) => {
                setSelectedAtoll(value as Atoll | 'All');
                setExpandedSiteId(null);
              }}
              options={['All', ...atolls.map((atoll) => atoll.name)]}
              allLabel="All Atolls"
            />
            <TextField
              id="island-filter"
              label="Island / Nearby Island"
              icon={<MapPin className="w-4 h-4 text-maldives-lagoon" />}
              value={islandTerm}
              onChange={setIslandTerm}
              placeholder="Type at least 2 letters"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">
              {activeFilterCount > 0
                ? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'} applied.`
                : 'Select an atoll, island, or site name to begin.'}
            </p>
            <button
              onClick={resetFilters}
              className="min-h-[44px] shrink-0 rounded-2xl bg-slate-100 px-4 text-xs font-bold text-slate-600 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </section>

        <DiveSiteMappingSection sites={filteredSites} hasFilter={hasFilter} />

        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">Directory</p>
            <h2 className="text-xl font-display font-bold text-maldives-deep">Filtered results</h2>
          </div>
          <p className="text-xs font-bold text-slate-400">{filteredSites.length} loaded</p>
        </div>

        <div className="space-y-6">
        {!hasFilter && (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
            <p className="font-bold text-maldives-deep">Select an atoll or search to begin.</p>
            <p className="mt-2 text-sm text-slate-500">AtollFeeNa loads only the dive sites relevant to your current filter.</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-3xl bg-white border border-slate-100" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            Unable to load dive sites for this filter.
          </div>
        )}

        {Object.entries(groupedSites).map(([letter, sites]) => (
          <section key={letter} aria-labelledby={`sites-${letter}`}>
            <h2 id={`sites-${letter}`} className="sticky top-0 z-10 -mx-4 mb-3 bg-slate-50/95 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              {letter}
            </h2>
            <div className="space-y-4">
              {sites.map((site) => (
                <DiveSiteCard
                  key={site.id}
                  site={site}
                  isExpanded={expandedSiteId === site.id}
                  onToggle={toggleExpand}
                  onEdit={startEditing}
                  onDelete={deleteSite}
                  canDelete={canPublishDiveSiteInfo}
                  onLogAtSite={onLogAtSite}
                />
              ))}
            </div>
          </section>
        ))}

        {hasFilter && !loading && filteredSites.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
            <p className="font-bold text-maldives-deep">No dive sites match these filters.</p>
            <p className="mt-2 text-sm text-slate-500">Try another atoll, island, or site name.</p>
          </div>
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full min-h-[52px] rounded-2xl bg-maldives-deep px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {loadingMore ? 'Loading...' : 'Load More Sites'}
          </button>
        )}
      </div>
      </div>

      <AnimatePresence>
        {isAddingSite && (
          <DiveSiteForm
            newSite={newSite}
            setNewSite={setNewSite}
            onClose={() => setIsAddingSite(false)}
            onSave={handleSave}
            editing={!!editingSiteId}
            canEditStructured={canPublishDiveSiteInfo}
            canEditSketchInstructions={canEditSketchInstructions}
            submitLabel={canPublishDiveSiteInfo ? undefined : 'Submit Suggestion'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  allLabel,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="w-full min-h-[52px] pl-4 pr-10 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-maldives-lagoon/20 appearance-none font-bold text-maldives-deep"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? allLabel : option}
            </option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          className="w-full min-h-[52px] pl-4 pr-10 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-maldives-lagoon/20 font-bold text-maldives-deep"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
      </div>
    </div>
  );
}
