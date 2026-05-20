import { lazy, Suspense } from 'react';
import { KIND_META } from '../../lib/siteKindMeta';
import { BathymetryExplainer } from './BathymetryExplainer';
import { DiveSite } from '../../types';

/**
 * Lazy-load the Leaflet map so the ~110 KB leaflet + markercluster bundle
 * is only fetched when the user actually scrolls to the DiveSites tab.
 * Suspense fallback keeps the 480-px card from collapsing on first paint
 * (no layout shift = better mobile UX).
 */
const DiveSiteClusterMap = lazy(() =>
  import('./DiveSiteClusterMap').then((m) => ({ default: m.DiveSiteClusterMap }))
);

interface DiveSiteMappingSectionProps {
  sites: DiveSite[];
  totalSites: number;
}

export function DiveSiteMappingSection({ sites, totalSites }: DiveSiteMappingSectionProps) {
  const mappedCount = sites.filter((site) => site.coordinates).length;

  return (
    <section
      aria-labelledby="dive-site-mapping-heading"
      className="mb-8"
    >
      <header className="mb-4 flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon mb-1">
            Filtered Map
          </p>
          <h2 id="dive-site-mapping-heading" className="text-xl font-display font-bold text-maldives-deep">
            Sites matching your filters
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            The map and directory use the same filtered database records.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="shown" value={sites.length} />
          <Stat label="mapped" value={mappedCount} />
          <Stat label="total" value={totalSites} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="relative h-[360px] w-full sm:h-[440px] lg:h-[520px]">
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-maldives-lagoon" />
                </div>
              }
            >
              <DiveSiteClusterMap sites={sites} />
            </Suspense>
            {mappedCount === 0 && (
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 text-sm font-semibold text-slate-600 shadow-lg">
                No matching sites have coordinates yet. The directory below still shows database records for these filters.
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-50 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Legend
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {(
                Object.entries(KIND_META) as [
                  keyof typeof KIND_META,
                  (typeof KIND_META)[keyof typeof KIND_META]
                ][]
              ).map(([kind, meta]) => (
                <li
                  key={kind}
                  className="flex items-center gap-2 text-[11px] text-slate-600"
                >
                  <span
                    aria-hidden
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ background: meta.color }}
                  />
                  <span className="font-semibold">{meta.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <BathymetryExplainer />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-lg font-display font-bold text-maldives-deep">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
