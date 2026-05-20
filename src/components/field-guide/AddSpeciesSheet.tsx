import { AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MarineLife } from '../../data/marineLife';

interface AddSpeciesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  newSpecies: Partial<MarineLife>;
  onChange: (next: Partial<MarineLife>) => void;
  onSave: () => void;
  isSaveDisabled: boolean;
}

export function AddSpeciesSheet({
  isOpen,
  onClose,
  categories,
  newSpecies,
  onChange,
  onSave,
  isSaveDisabled
}: AddSpeciesSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
          onClick={onClose}
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

            <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-maldives-deep">Add New Species</h2>
                <button onClick={onClose} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Common Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bluefin Trevally"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold"
                    value={newSpecies.name || ''}
                    onChange={e => onChange({ ...newSpecies, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Scientific Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Caranx melampygus"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold italic"
                    value={newSpecies.scientificName || ''}
                    onChange={e => onChange({ ...newSpecies, scientificName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Category</label>
                    <select
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold appearance-none"
                      value={newSpecies.category}
                      onChange={e => onChange({ ...newSpecies, category: e.target.value as MarineLife['category'] })}
                    >
                      {categories
                        .filter(category => category !== 'All')
                        .map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Rarity</label>
                    <select
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-bold appearance-none"
                      value={newSpecies.rarity}
                      onChange={e => onChange({ ...newSpecies, rarity: e.target.value as MarineLife['rarity'] })}
                    >
                      <option value="Common">Common</option>
                      <option value="Uncommon">Uncommon</option>
                      <option value="Rare">Rare</option>
                      <option value="Legendary">Legendary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Short Description</label>
                  <textarea
                    placeholder="Identifiable characteristics, behavior..."
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl min-h-[100px] focus:ring-2 focus:ring-maldives-lagoon/20 font-medium"
                    value={newSpecies.description || ''}
                    onChange={e => onChange({ ...newSpecies, description: e.target.value })}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-[10px] font-medium text-blue-800 leading-relaxed uppercase tracking-wider">
                    Adding a new species allows you to log unique sightings. You can eventually attach photos to these entries.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 pb-12">
              <button
                onClick={onSave}
                disabled={isSaveDisabled}
                className="w-full py-5 bg-maldives-deep text-white rounded-[24px] font-bold shadow-xl shadow-maldives-shallow/50 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest disabled:opacity-50"
              >
                Create Species
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
