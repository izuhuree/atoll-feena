import { lazy, Suspense, useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { Map, ImageIcon, Sparkles, Loader2, AlertCircle, Save } from 'lucide-react';
import { DiveSite } from '../../types';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { SiteSketchSvg } from './SiteSketchSvg';
import { useSiteSketch } from '../../hooks/useSiteSketch';

const SiteLocatorMap = lazy(() =>
  import('./SiteLocatorMap').then((m) => ({ default: m.SiteLocatorMap }))
);

type Tab = 'locator' | 'sketch';

interface SiteVisualsPanelProps {
  site: DiveSite;
}

/**
 * Two-tab visual panel embedded inside the expanded dive-site card.
 *
 *  • Locator tab: tiny Leaflet Maldives map with the site pinned and labelled.
 *  • Sketch tab: procedural SVG by default; if a cached AI sketch URL exists,
 *    that takes over. Admins see a "Generate AI sketch" button that calls
 *    Gemini Imagen and caches the result back to Firebase Storage.
 */
export function SiteVisualsPanel({ site }: SiteVisualsPanelProps) {
  const [tab, setTab] = useState<Tab>('locator');
  const [instructions, setInstructions] = useState(site.sketchInstructions || site.description || '');
  const [isSavingInstructions, setIsSavingInstructions] = useState(false);
  const [instructionsMessage, setInstructionsMessage] = useState<string | null>(null);
  const { imageUrl, canGenerate, generate, isGenerating, error } = useSiteSketch(site);

  useEffect(() => {
    setInstructions(site.sketchInstructions || site.description || '');
  }, [site.description, site.sketchInstructions, site.id]);

  const saveInstructions = async () => {
    if (!db || !canGenerate) return;
    const cleaned = instructions.trim();
    if (!cleaned) {
      setInstructionsMessage('Sketch instructions cannot be empty.');
      return;
    }

    setIsSavingInstructions(true);
    setInstructionsMessage(null);

    try {
      const updatedAt = new Date().toISOString();
      await setDoc(
        doc(db, 'diveSites', site.id),
        {
          sketchInstructions: cleaned,
          sketchInstructionsUpdatedAt: updatedAt,
          updatedAt,
        },
        { merge: true }
      );
      setInstructionsMessage('Sketch instructions saved.');
    } catch (err) {
      console.error('SiteVisualsPanel.saveInstructions', err);
      setInstructionsMessage(err instanceof Error ? err.message : 'Failed to save sketch instructions.');
    } finally {
      setIsSavingInstructions(false);
    }
  };

  return (
    <div
      className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden mb-6"
      onClick={(event) => event.stopPropagation()}
    >
      <div
        role="tablist"
        aria-label="Site visuals"
        className="flex border-b border-slate-100 bg-white"
      >
        <TabButton active={tab === 'locator'} onClick={() => setTab('locator')} icon={Map} label="Locator" />
        <TabButton active={tab === 'sketch'} onClick={() => setTab('sketch')} icon={ImageIcon} label="Site Sketch" />
      </div>

      <div
        className="relative w-full aspect-square sm:aspect-[4/3] bg-white"
        role="tabpanel"
      >
        {tab === 'locator' ? (
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                <Loader2 className="w-6 h-6 animate-spin text-maldives-lagoon" />
              </div>
            }
          >
            <SiteLocatorMap site={site} />
          </Suspense>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`AI-generated dive-briefing sketch of ${site.name}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0">
            <SiteSketchSvg site={site} />
          </div>
        )}
      </div>

      {tab === 'sketch' && (
        <div className="space-y-3 border-t border-slate-100 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {imageUrl ? 'AI sketch · cached' : 'Procedural fallback'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">
                {site.sketchInstructions?.trim() ? 'Using sketch instructions' : 'Using site description'}
              </p>
            </div>
            {canGenerate && (
              <button
                onClick={() => generate(instructions)}
                disabled={isGenerating}
                className={cn(
                  'min-h-[40px] px-3 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors',
                  isGenerating
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-maldives-deep text-white active:scale-95'
                )}
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGenerating ? 'Generating...' : imageUrl ? 'Regenerate' : 'Generate'}
              </button>
            )}
          </div>

          {canGenerate && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <label
                htmlFor={`sketch-instructions-${site.id}`}
                className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                Sketch Instructions
              </label>
              <textarea
                id={`sketch-instructions-${site.id}`}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                className="min-h-[112px] w-full rounded-2xl border-none bg-white p-4 text-sm font-medium leading-relaxed text-slate-700 focus:ring-2 focus:ring-maldives-lagoon/20"
                placeholder="Describe reef shape, channels, sandy patches, drop-offs, swim-throughs, cleaning stations and route direction."
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium leading-relaxed text-slate-500">
                  Approved contributors maintain this field so sketches stay useful for dive briefings.
                </p>
                <button
                  type="button"
                  onClick={saveInstructions}
                  disabled={isSavingInstructions}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-white px-4 text-[11px] font-bold uppercase tracking-widest text-maldives-deep shadow-sm active:scale-95 disabled:text-slate-400"
                >
                  {isSavingInstructions ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {isSavingInstructions ? 'Saving' : 'Save'}
                </button>
              </div>
              {instructionsMessage && (
                <p className="mt-2 text-xs font-semibold text-slate-500">{instructionsMessage}</p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 border-t border-rose-100 bg-rose-50 text-[11px] text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Map;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex-1 min-h-[44px] flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-colors',
        active
          ? 'border-maldives-lagoon text-maldives-deep'
          : 'border-transparent text-slate-400 active:text-maldives-lagoon'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
