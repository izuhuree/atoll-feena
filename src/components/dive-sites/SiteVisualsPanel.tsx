import { lazy, Suspense, useState } from 'react';
import { Map, ImageIcon, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { DiveSite } from '../../types';
import { cn } from '../../lib/utils';
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
  const { imageUrl, canGenerate, generate, isGenerating, error } = useSiteSketch(site);

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden mb-6">
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
        <div className="flex items-center justify-between gap-3 p-3 border-t border-slate-100 bg-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {imageUrl ? 'AI sketch · cached' : 'Procedural fallback'}
          </p>
          {canGenerate && (
            <button
              onClick={generate}
              disabled={isGenerating}
              className={cn(
                'min-h-[36px] px-3 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors',
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
              {isGenerating ? 'Generating…' : imageUrl ? 'Regenerate' : 'Generate AI sketch'}
            </button>
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
