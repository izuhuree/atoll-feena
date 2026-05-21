import { Loader2, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { DiveSite, SourceReference } from '../../types';
import { cn } from '../../lib/utils';
import { useDiveSiteDescriptionAI } from '../../hooks/useDiveSiteDescriptionAI';

interface AiDescriptionPanelProps {
  site: Partial<DiveSite>;
  canGenerate: boolean;
  onApply: (description: string, sources: SourceReference[]) => void;
}

export function AiDescriptionPanel({ site, canGenerate, onApply }: AiDescriptionPanelProps) {
  const { draft, isGenerating, error, generate } = useDiveSiteDescriptionAI();

  if (!canGenerate) return null;

  return (
    <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">
            Verified Description
          </p>
          <p className="text-xs font-medium leading-relaxed text-slate-600">
            Generate a sourced draft, review the links, then apply it before saving.
          </p>
        </div>
        <button
          type="button"
          onClick={() => generate(site)}
          disabled={isGenerating || !site.name}
          className={cn(
            'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-4 text-xs font-bold uppercase tracking-widest',
            isGenerating
              ? 'bg-white text-slate-400'
              : 'bg-maldives-deep text-white active:scale-95 disabled:bg-slate-200 disabled:text-slate-400'
          )}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? 'Searching' : 'Improve with AI'}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-white p-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {draft && (
        <div className="mt-3 space-y-3 rounded-2xl bg-white p-3">
          <p className="text-sm leading-relaxed text-slate-700">{draft.description}</p>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sources to review
            </p>
            <ul className="space-y-2">
              {draft.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[36px] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-maldives-deep"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-maldives-lagoon" />
                    <span className="line-clamp-1">{source.title || source.domain || source.url}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {draft.notes && <p className="text-xs font-medium text-slate-500">{draft.notes}</p>}
          <button
            type="button"
            onClick={() => onApply(draft.description, draft.sources)}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-maldives-lagoon px-4 text-xs font-bold uppercase tracking-widest text-white active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            Use This Description
          </button>
        </div>
      )}
    </div>
  );
}
