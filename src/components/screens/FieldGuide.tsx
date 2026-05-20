import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
import type { MarineLife } from '../../data/marineLife';
import { 
  Search, 
  ChevronLeft, 
  Filter, 
  Info, 
  Star, 
  Camera, 
  Trash2, 
  CameraOff, 
  Plus, 
  Edit2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useMarineLife } from '../../hooks/useMarineLife';
import { AddSpeciesSheet } from '../field-guide/AddSpeciesSheet';

interface FieldGuideProps {
  onBack: () => void;
}

export function FieldGuide({ onBack }: FieldGuideProps) {
  const { allLife, loading, saveLife, deleteLife } = useMarineLife();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);
  const [selectedLife, setSelectedLife] = useState<MarineLife | null>(null);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});
  const [isAddingSpecies, setIsAddingSpecies] = useState(false);
  const [newSpecies, setNewSpecies] = useState<Partial<MarineLife>>({
    category: 'Fish',
    rarity: 'Common'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingSpeciesId, setEditingSpeciesId] = useState<string | null>(null);

  // Load user photos from local storage
  useEffect(() => {
    const saved = localStorage.getItem('fee_na_field_guide_photos');
    if (saved) {
      try {
        setUserPhotos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse field guide photos', e);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maldives-lagoon"></div>
      </div>
    );
  }

  // Save user photos to local storage
  const savePhoto = (id: string, url: string) => {
    const next = { ...userPhotos, [id]: url };
    setUserPhotos(next);
    localStorage.setItem('fee_na_field_guide_photos', JSON.stringify(next));
  };

  const deletePhoto = (id: string) => {
    const next = { ...userPhotos };
    delete next[id];
    setUserPhotos(next);
    localStorage.setItem('fee_na_field_guide_photos', JSON.stringify(next));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedLife) {
      const reader = new FileReader();
      reader.onloadend = () => {
        savePhoto(selectedLife.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSpecies = () => {
    if (!newSpecies.name || !newSpecies.scientificName) return;
    const speciesToSave: MarineLife = {
      id: editingSpeciesId || `custom-life-${Date.now()}`,
      name: newSpecies.name,
      scientificName: newSpecies.scientificName,
      category: newSpecies.category as MarineLife['category'],
      description: newSpecies.description || '',
      rarity: newSpecies.rarity as MarineLife['rarity']
    };
    saveLife(speciesToSave);
    setIsAddingSpecies(false);
    setEditingSpeciesId(null);
    setNewSpecies({ category: 'Fish', rarity: 'Common' });
  };

  const startEditingSpecies = (life: MarineLife, e: MouseEvent) => {
    e.stopPropagation();
    setNewSpecies(life);
    setEditingSpeciesId(life.id);
    setIsAddingSpecies(true);
  };

  const handleDeleteSpecies = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    deleteLife(id);
  };

  const categories = [
    'All',
    ...Array.from(new Set(allLife.map((life) => life.category))).sort(),
  ];

  const filteredLife = allLife.filter(life => {
    const matchesSearch = life.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         life.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || life.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const discoveredCount = Object.keys(userPhotos).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-display font-bold text-maldives-deep">Field Guide</h1>
              <p className="text-[10px] font-bold text-maldives-turquoise uppercase tracking-widest leading-none mt-1">
                {discoveredCount} / {allLife.length} Discovered
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddingSpecies(true)}
              className="w-10 h-10 bg-maldives-turquoise text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="relative w-12 h-12">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="2" />
                <circle 
                  cx="18" cy="18" r="16" fill="none" 
                  className="stroke-maldives-turquoise transition-all duration-1000" 
                  strokeWidth="2" 
                  strokeDasharray={`${(discoveredCount / allLife.length) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-maldives-deep">
                {Math.round((discoveredCount / allLife.length) * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search species..."
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-maldives-lagoon/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="relative">
            <select 
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-maldives-deep focus:ring-2 focus:ring-maldives-lagoon/20 appearance-none"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setSelectedSpeciesId(null);
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} Species</option>
              ))}
            </select>
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-maldives-deep focus:ring-2 focus:ring-maldives-lagoon/20 appearance-none"
              value={selectedSpeciesId || ''}
              onChange={(e) => setSelectedSpeciesId(e.target.value || null)}
            >
              <option value="">Quick Select Species...</option>
              {allLife.filter(l => filterCategory === 'All' || l.category === filterCategory).map(life => (
                <option key={life.id} value={life.id}>{life.name}</option>
              ))}
            </select>
            <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-maldives-lagoon w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </header>

      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredLife.filter(l => !selectedSpeciesId || l.id === selectedSpeciesId).map((life, index) => {
          const userPhoto = userPhotos[life.id];
          const isCustom = life.id.startsWith('custom-life-');
          return (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              key={life.id}
              onClick={() => setSelectedLife(life)}
              className="group flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden text-left active:scale-[0.98] transition-transform relative"
            >
              <div className="h-40 w-full relative">
                {userPhoto ? (
                  <img 
                    src={userPhoto} 
                    alt={life.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-200">
                      <CameraOff className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Tap to add photo</span>
                  </div>
                )}
                
                <div className={cn(
                  "absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest",
                  life.rarity === 'Legendary' ? "bg-amber-400 text-white" :
                  life.rarity === 'Rare' ? "bg-purple-500 text-white" :
                  life.rarity === 'Uncommon' ? "bg-maldives-lagoon text-white" :
                  "bg-slate-900/10 text-slate-400 backdrop-blur-sm"
                )}>
                  {life.rarity}
                </div>

                {isCustom && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => startEditingSpecies(life, e)}
                      className="p-2 bg-black/20 backdrop-blur-md rounded-lg text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteSpecies(life.id, e)}
                      className="p-2 bg-black/20 backdrop-blur-md rounded-lg text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-maldives-deep leading-tight truncate mb-1">{life.name}</p>
                <p className="text-[9px] text-slate-400 italic mb-3 truncate leading-none">{life.scientificName}</p>
                <div className="inline-block px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-bold uppercase tracking-widest group-hover:bg-maldives-shallow/20 group-hover:text-maldives-lagoon transition-colors">
                  {life.category}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AddSpeciesSheet
        isOpen={isAddingSpecies}
        onClose={() => setIsAddingSpecies(false)}
        categories={categories}
        newSpecies={newSpecies}
        onChange={setNewSpecies}
        onSave={handleSaveSpecies}
        isSaveDisabled={!newSpecies.name || !newSpecies.scientificName}
      />

      <AnimatePresence>
        {selectedLife && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
            onClick={() => setSelectedLife(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full rounded-t-[48px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-2 w-12 bg-slate-200 rounded-full mx-auto mt-4 mb-2 opacity-50" />
              
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="h-80 w-full relative">
                  {userPhotos[selectedLife.id] ? (
                    <>
                      <img 
                        src={userPhotos[selectedLife.id]} 
                        alt={selectedLife.name} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => deletePhoto(selectedLife.id)}
                        className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-lg text-maldives-lagoon">
                        <Camera className="w-10 h-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-maldives-deep">No sighting photo</p>
                        <p className="text-sm text-slate-400">Tap below to add your own capture</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
                </div>
                
                <div className="px-8 pb-32 -mt-8 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-maldives-deep leading-tight">{selectedLife.name}</h2>
                      <p className="text-sm text-slate-400 italic font-medium">{selectedLife.scientificName}</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl shadow-sm",
                      userPhotos[selectedLife.id] ? "bg-maldives-shallow/30 text-maldives-lagoon" : "bg-slate-50 text-slate-200"
                    )}>
                      <Star className={cn("w-6 h-6", userPhotos[selectedLife.id] && "fill-current")} />
                    </div>
                  </div>

                  <div className="flex gap-2 mb-8">
                    <span className="px-4 py-2 bg-maldives-shallow/20 rounded-xl text-[10px] font-bold text-maldives-lagoon uppercase tracking-widest">
                      {selectedLife.category}
                    </span>
                    <span className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {selectedLife.rarity}
                    </span>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Species Information</h3>
                      <p className="text-slate-600 leading-relaxed text-sm font-medium">
                        {selectedLife.description}
                      </p>
                    </section>

                    <section className="bg-maldives-sand/30 p-6 rounded-[32px] border border-yellow-100/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Info className="w-5 h-5 text-amber-600" />
                        </div>
                        <h4 className="font-bold text-amber-900 text-sm italic">Sighting Wisdom</h4>
                      </div>
                      <p className="text-amber-800/70 text-xs leading-relaxed font-medium">
                        Maintain neutral buoyancy and keep a respectful distance. Avoid erratic movements to increase your chance of a long, peaceful encounter.
                      </p>
                    </section>
                  </div>
                </div>
              </div>

              <div className="p-6 pb-10 bg-white border-t border-slate-100">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                
                {userPhotos[selectedLife.id] ? (
                  <button 
                    onClick={() => setSelectedLife(null)}
                    className="w-full py-5 bg-maldives-deep text-white rounded-[24px] font-bold shadow-xl shadow-maldives-shallow/50 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest"
                  >
                    Close Log
                  </button>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 bg-maldives-turquoise text-white rounded-[24px] font-bold shadow-xl shadow-maldives-turquoise/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest"
                  >
                    <Camera className="w-5 h-5" />
                    Record Finding
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
