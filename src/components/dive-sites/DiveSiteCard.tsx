import {
  AlertCircle,
  CircleDot,
  Compass,
  Edit2,
  Eye,
  MapPin,
  ShieldCheck,
  Thermometer,
  Trash2,
  Waves,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { DiveSite } from '../../types';
import { SiteVisualsPanel } from './SiteVisualsPanel';
import { useSiteIntelligence } from '../../hooks/useSiteIntelligence';

interface DiveSiteCardProps {
  site: DiveSite;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onEdit: (site: DiveSite) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  onLogAtSite: (siteId: string) => void;
}

export function DiveSiteCard({
  site,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  canDelete,
  onLogAtSite,
}: DiveSiteCardProps) {
  const isCustom = site.id.startsWith('custom-');
  const { summary, loading: intelligenceLoading } = useSiteIntelligence(site.id, isExpanded && !isCustom);

  return (
    <motion.div
      layout
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300"
    >
      <div className="p-5 cursor-pointer" onClick={() => onToggle(site.id)}>
        <div className="flex justify-between items-start gap-3 mb-2">
          <div>
            <h3 className="text-lg font-display font-bold text-maldives-deep">{site.name}</h3>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3 text-maldives-lagoon" />
              {site.atoll}{site.islandBase ? ` · ${site.islandBase}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
              site.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
              site.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
              site.difficulty === 'unknown' ? 'bg-slate-100 text-slate-600' :
              'bg-purple-100 text-purple-700'
            )}>
              {site.difficulty}
            </span>
            <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
              <button onClick={() => onEdit(site)} className="p-2 text-slate-300 hover:text-maldives-lagoon">
                <Edit2 className="w-4 h-4" />
              </button>
              {isCustom && canDelete && (
                <button onClick={() => onDelete(site.id)} className="p-2 text-slate-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className={cn('text-slate-600 text-sm leading-relaxed mb-4', !isExpanded && 'line-clamp-2')}>
          {site.description}
        </p>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Compass className="w-4 h-4" /> {site.current}
          </div>
          {site.depthMin !== undefined && site.depthMax !== undefined && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Thermometer className="w-4 h-4" /> {site.depthMin}-{site.depthMax}m
            </div>
          )}
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
                <Detail label="Best Season" value={site.bestSeason || 'Year-round'} />
                <Detail label="Island Base" value={site.islandBase || 'Not recorded'} />
                {site.coordinates && (
                  <Detail
                    label="Coordinates"
                    value={`${site.coordinates.lat.toFixed(3)}, ${site.coordinates.lng.toFixed(3)}`}
                  />
                )}
                {site.protectedStatus && site.protectedStatus !== 'none' && (
                  <Detail label="Status" value={site.protectedStatus} />
                )}
              </div>

              <SiteVisualsPanel site={site} />

              <SiteIntelligenceSummary summary={summary} loading={intelligenceLoading} />

              <div className="flex flex-wrap gap-1.5 mb-6">
                {site.marineLifeHighlights.map((life) => (
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
                onClick={(event) => {
                  event.stopPropagation();
                  onLogAtSite(site.id);
                }}
                className="w-full min-h-[52px] bg-maldives-lagoon text-white rounded-2xl font-bold active:scale-[0.98] transition-transform shadow-lg shadow-maldives-shallow/50 mb-2"
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
        <div className={cn('px-5 py-3 flex items-center justify-between', site.isProtected ? 'bg-orange-50' : 'bg-slate-50')}>
          <div className="flex items-center gap-2">
            <ShieldCheck className={cn('w-4 h-4', site.isProtected ? 'text-orange-600' : 'text-slate-400')} />
            <span className={cn('text-[10px] font-bold uppercase tracking-wider', site.isProtected ? 'text-orange-700' : 'text-slate-500')}>
              {site.isProtected ? 'Protected Marine Area' : 'Non-Protected Site'}
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
}

function SiteIntelligenceSummary({
  summary,
  loading,
}: {
  summary: ReturnType<typeof useSiteIntelligence>['summary'];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-500">
        Loading recent diver reports...
      </div>
    );
  }

  if (summary.reportCount === 0) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-500">
        No recent diver condition reports yet.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-maldives-shallow/30 bg-maldives-shallow/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">
            Recent Diver Intelligence
          </p>
          <p className="text-[11px] font-semibold text-slate-500">
            {summary.reportCount} report{summary.reportCount === 1 ? '' : 's'} · {summary.confidence} confidence
          </p>
        </div>
        <Waves className="h-5 w-5 text-maldives-lagoon" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Vis" value={summary.averageVisibility ? `${summary.averageVisibility}m` : '--'} />
        <MiniStat label="Current" value={summary.typicalCurrent || '--'} />
        <MiniStat label="Temp" value={summary.averageWaterTemp ? `${summary.averageWaterTemp}°C` : '--'} />
      </div>
      {summary.topHazards.length > 0 && (
        <TagRow label="Hazards" items={summary.topHazards.map((item) => item.label)} tone="rose" />
      )}
      {summary.reefSignals.length > 0 && (
        <TagRow label="Reef" items={summary.reefSignals.map((item) => item.label)} tone="emerald" />
      )}
      {summary.debrisSignals.length > 0 && (
        <TagRow label="Debris" items={summary.debrisSignals.map((item) => item.label)} tone="amber" />
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-bold capitalize text-maldives-deep">{value}</p>
    </div>
  );
}

function TagRow({ label, items, tone }: { label: string; items: string[]; tone: 'rose' | 'emerald' | 'amber' }) {
  const toneClass = {
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];

  return (
    <div className="mt-3">
      <p className="mb-1 text-[8px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={cn('rounded-lg px-2 py-1 text-[10px] font-bold capitalize', toneClass)}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">{label}</label>
      <p className="text-sm font-semibold text-maldives-deep">{value}</p>
    </div>
  );
}
