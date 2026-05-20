import { ReactNode, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Search,
  Filter,
  CircleDot,
  Plus,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { Atoll, DiveSite } from '../../types';
import { useDiveSites } from '../../hooks/useDiveSites';
import { useAtolls } from '../../hooks/useAtolls';
import { useDiveSiteSuggestions } from '../../hooks/useDiveSiteSuggestions';
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
  const { allSites, loading, saveSite, deleteSite } = useDiveSites();
  const { submitSuggestion } = useDiveSiteSuggestions();
  const { canPublishDiveSiteInfo, canEditSketchInstructions } = useUserRole(user);
  const { atolls } = useAtolls();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtoll, setSelectedAtoll] = useState<Atoll | 'All'>('All');
  const [selectedIsland, setSelectedIsland] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
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

  const islandOptions = useMemo(() => {
    return [...new Set(
      allSites
        .filter((site) => selectedAtoll === 'All' || site.atoll === selectedAtoll)
        .map((site) => site.islandBase)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [allSites, selectedAtoll]);

  const typeOptions = useMemo(() => {
    return [...new Set(allSites.map((site) => site.type).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [allSites]);

  const filteredSites = useMemo(() => {
    return allSites
      .filter((site) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch = !query ||
          site.name.toLowerCase().includes(query) ||
          site.atoll.toLowerCase().includes(query) ||
          site.islandBase?.toLowerCase().includes(query) ||
          site.type.toLowerCase().includes(query) ||
          site.marineLifeHighlights.some((life) => life.toLowerCase().includes(query));
        const matchesAtoll = selectedAtoll === 'All' || site.atoll === selectedAtoll;
        const matchesIsland = selectedIsland === 'All' || site.islandBase === selectedIsland;
        const matchesType = selectedType === 'All' || site.type === selectedType;
        return matchesSearch && matchesAtoll && matchesIsland && matchesType;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allSites, searchTerm, selectedAtoll, selectedIsland, selectedType]);

  const groupedSites = useMemo(() => {
    return filteredSites.reduce<Record<string, DiveSite[]>>((groups, site) => {
      const letter = site.name[0]?.toUpperCase().match(/[A-Z]/) ? site.name[0].toUpperCase() : '#';
      groups[letter] = [...(groups[letter] || []), site];
      return groups;
    }, {});
  }, [filteredSites]);

  const activeFilterCount = [
    searchTerm.trim(),
    selectedAtoll !== 'All',
    selectedIsland !== 'All',
    selectedType !== 'All',
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maldives-lagoon"></div>
      </div>
    );
  }

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
    setSelectedIsland('All');
    setSelectedType('All');
    setExpandedSiteId(null);
  };

  return (
    <div className="px-4 pt-10 pb-32 sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-7xl justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 text-maldives-deep">Dive Sites</h1>
          <p className="text-slate-500 text-sm">
            {filteredSites.length} of {allSites.length} Maldives sites, sorted A-Z
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
        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search site, island, atoll or marine life"
              className="w-full min-h-[52px] pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-maldives-lagoon/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SelectField
              id="atoll-filter"
              label="Atoll"
              icon={<Filter className="w-4 h-4" />}
              value={selectedAtoll}
              onChange={(value) => {
                setSelectedAtoll(value as Atoll | 'All');
                setSelectedIsland('All');
                setExpandedSiteId(null);
              }}
              options={['All', ...atolls.map((atoll) => atoll.name)]}
              allLabel="All Atolls"
            />
            <SelectField
              id="island-filter"
              label="Island"
              icon={<MapPin className="w-4 h-4 text-maldives-lagoon" />}
              value={selectedIsland}
              onChange={setSelectedIsland}
              options={['All', ...islandOptions]}
              allLabel="All Islands"
            />
            <SelectField
              id="type-filter"
              label="Site Type"
              icon={<CircleDot className="w-4 h-4" />}
              value={selectedType}
              onChange={setSelectedType}
              options={['All', ...typeOptions]}
              allLabel="All Site Types"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">
              {activeFilterCount > 0
                ? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'} applied.`
                : 'Choose an atoll, then an island, to narrow local dive options.'}
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

        <DiveSiteMappingSection sites={filteredSites} totalSites={allSites.length} />

        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">Directory</p>
            <h2 className="text-xl font-display font-bold text-maldives-deep">Alphabetical results</h2>
          </div>
          <p className="text-xs font-bold text-slate-400">{filteredSites.length}/{allSites.length} sites</p>
        </div>

        <div className="space-y-6">
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

        {filteredSites.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
            <p className="font-bold text-maldives-deep">No dive sites match these filters.</p>
            <p className="mt-2 text-sm text-slate-500">Try another atoll, island, type or search term.</p>
          </div>
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
