import { AlertCircle, ShieldCheck, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Atoll, DiveSite } from '../../types';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import { useAtolls } from '../../hooks/useAtolls';
import { AiDescriptionPanel } from './AiDescriptionPanel';

interface DiveSiteFormProps {
  newSite: Partial<DiveSite>;
  setNewSite: (site: Partial<DiveSite>) => void;
  onClose: () => void;
  onSave: () => void;
  editing: boolean;
  canEditStructured: boolean;
  canEditSketchInstructions: boolean;
  geminiApiKey?: string;
  submitLabel?: string;
}

/**
 * Bottom-sheet add/edit form for custom dive sites.
 * Extracted from DiveSites.tsx so the screen file stays under 500 lines and
 * the form can be reused or unit-tested independently.
 */
export function DiveSiteForm({
  newSite,
  setNewSite,
  onClose,
  onSave,
  editing,
  canEditStructured,
  canEditSketchInstructions,
  geminiApiKey,
  submitLabel,
}: DiveSiteFormProps) {
  const { atolls } = useAtolls();
  const setDescription = (description: string) => {
    const hasCustomSketchInstructions = !!newSite.sketchInstructions?.trim();
    setNewSite({
      ...newSite,
      description,
      sketchInstructions: canEditSketchInstructions && !hasCustomSketchInstructions ? description : newSite.sketchInstructions,
    });
  };

  const applyAiDescription = (
    description: string,
    descriptionSourceRefs: NonNullable<DiveSite['descriptionSourceRefs']>
  ) => {
    const generatedAt = new Date().toISOString();
    const hasCustomSketchInstructions = !!newSite.sketchInstructions?.trim();
    setNewSite({
      ...newSite,
      description,
      descriptionSourceRefs,
      descriptionGeneratedAt: generatedAt,
      descriptionGeneratedBy: auth?.currentUser?.uid || 'ai-assisted',
      sketchInstructions: canEditSketchInstructions && !hasCustomSketchInstructions ? description : newSite.sketchInstructions,
    });
  };

  const setSketchInstructions = (sketchInstructions: string) => {
    setNewSite({
      ...newSite,
      sketchInstructions,
      sketchInstructionsUpdatedAt: new Date().toISOString(),
    });
  };

  return (
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
        className="bg-white w-full rounded-t-[48px] max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 w-12 bg-slate-200 rounded-full mx-auto mt-4 mb-2 opacity-50" />

        <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-maldives-deep">
              {editing ? (canEditStructured ? 'Edit Dive Site' : 'Suggest Site Edit') : 'Add New Dive Site'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="site-name"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2"
              >
                Site Name
              </label>
              <input
                id="site-name"
                type="text"
                placeholder="e.g. Broken Rock"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-semibold min-h-[52px]"
                value={newSite.name || ''}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="site-atoll"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2"
                >
                  Atoll
                </label>
                <select
                  id="site-atoll"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-semibold appearance-none min-h-[52px]"
                  value={newSite.atoll}
                  disabled={!canEditStructured && editing}
                  onChange={(e) =>
                    setNewSite({ ...newSite, atoll: e.target.value as Atoll })
                  }
                >
                  {atolls.length === 0 && <option value="">Atolls not configured</option>}
                  {atolls.map((atoll) => (
                    <option key={atoll.id} value={atoll.name}>
                      {atoll.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="site-difficulty"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2"
                >
                  Difficulty
                </label>
                <select
                  id="site-difficulty"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-semibold appearance-none min-h-[52px]"
                  value={newSite.difficulty}
                  disabled={!canEditStructured}
                  onChange={(e) =>
                    setNewSite({
                      ...newSite,
                      difficulty: e.target.value as DiveSite['difficulty'],
                    })
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="site-type"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2"
                >
                  Type
                </label>
                <input
                  id="site-type"
                  type="text"
                  placeholder="Reef, Thila, Wreck..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-semibold min-h-[52px]"
                  value={newSite.type || ''}
                  disabled={!canEditStructured}
                  onChange={(e) => setNewSite({ ...newSite, type: e.target.value })}
                />
              </div>
              <div>
                <label
                  htmlFor="site-depth"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2"
                >
                  Max Depth (m)
                </label>
                <input
                  id="site-depth"
                  type="number"
                  inputMode="numeric"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-semibold min-h-[52px]"
                  value={newSite.depthMax || ''}
                  disabled={!canEditStructured}
                  onChange={(e) =>
                    setNewSite({ ...newSite, depthMax: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="site-season"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2"
              >
                Best Season
              </label>
              <input
                id="site-season"
                type="text"
                placeholder="e.g. Dec - May"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 font-semibold min-h-[52px]"
                value={newSite.bestSeason || ''}
                disabled={!canEditStructured}
                onChange={(e) =>
                  setNewSite({ ...newSite, bestSeason: e.target.value })
                }
              />
            </div>

            <div className="flex gap-4">
              <button
                disabled={!canEditStructured}
                onClick={() =>
                  setNewSite({ ...newSite, isProtected: !newSite.isProtected })
                }
                className={cn(
                  'flex-1 min-h-[52px] p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest',
                  newSite.isProtected
                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                    : 'bg-slate-50 border-transparent text-slate-500'
                )}
                aria-pressed={!!newSite.isProtected}
              >
                <ShieldCheck className="w-4 h-4" />
                Protected
              </button>
              <button
                disabled={!canEditStructured}
                onClick={() =>
                  setNewSite({
                    ...newSite,
                    regulatedAccess: !newSite.regulatedAccess,
                  })
                }
                className={cn(
                  'flex-1 min-h-[52px] p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest',
                  newSite.regulatedAccess
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-transparent text-slate-500'
                )}
                aria-pressed={!!newSite.regulatedAccess}
              >
                <AlertCircle className="w-4 h-4" />
                Regulated
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="site-description"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block"
                >
                  Description
                </label>
                {newSite.descriptionSourceRefs?.length ? (
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-700">
                    {newSite.descriptionSourceRefs.length} sources
                  </span>
                ) : null}
              </div>
              <textarea
                id="site-description"
                placeholder="Mention currents, unique features..."
                className="w-full p-5 bg-slate-50 border-none rounded-2xl min-h-[100px] focus:ring-2 focus:ring-maldives-lagoon/20 font-medium"
                maxLength={1000}
                value={newSite.description || ''}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="mt-2 text-xs font-medium text-slate-500">
                {(newSite.description || '').length}/1000 characters. Keep it short, factual, and useful for divers.
              </p>
              <AiDescriptionPanel
                site={newSite}
                canGenerate
                geminiApiKey={geminiApiKey}
                onApply={applyAiDescription}
              />
            </div>

            {canEditSketchInstructions && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label
                  htmlFor="site-sketch-instructions"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block"
                >
                  Sketch Instructions
                </label>
                <button
                  type="button"
                  onClick={() => setSketchInstructions(newSite.description || '')}
                  className="min-h-[32px] rounded-full bg-slate-100 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                >
                  Use Description
                </button>
              </div>
              <textarea
                id="site-sketch-instructions"
                placeholder="Describe reef shape, swim-throughs, channels, sandy patches, drop-offs, cleaning stations..."
                className="w-full p-5 bg-slate-50 border-none rounded-2xl min-h-[120px] focus:ring-2 focus:ring-maldives-lagoon/20 font-medium"
                value={newSite.sketchInstructions || newSite.description || ''}
                onChange={(e) => setSketchInstructions(e.target.value)}
              />
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                Used only for AI sketch generation. Keep the public description simple for divers.
              </p>
            </div>
            )}

            {!canEditStructured && (
              <p className="rounded-2xl bg-cyan-50 p-4 text-xs font-semibold leading-relaxed text-cyan-800">
                Your contribution will go to the review queue. Trusted reviewers can approve description updates and maintain sketch instructions.
              </p>
            )}
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 pb-12">
          <button
            onClick={onSave}
            disabled={!newSite.name}
            className="w-full min-h-[56px] py-4 bg-maldives-deep text-white rounded-[24px] font-bold shadow-xl shadow-maldives-shallow/50 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {submitLabel || (!canEditStructured ? 'Submit Suggestion' : editing ? 'Update Dive Site' : 'Save Dive Site')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
