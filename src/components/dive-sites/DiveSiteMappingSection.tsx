import { lazy, Suspense } from 'react';
import { KIND_META } from '../../data/mapDiveSites';
import { BathymetryExplainer } from './BathymetryExplainer';

/**
 * Lazy-load the Leaflet map so the ~110 KB leaflet + markercluster bundle
 * is only fetched when the user actually scrolls to the DiveSites tab.
 * Suspense fallback keeps the 480-px card from collapsing on first paint
 * (no layout shift = better mobile UX).
 */
const DiveSiteClusterMap = lazy(() =>
  import('./DiveSiteClusterMap').then((m) => ({ default: m.DiveSiteClusterMap }))
);

export function DiveSiteMappingSection() {
  return (
    <section
      aria-labelledby="dive-site-mapping-heading"
      className="mt-12 pt-2"
    >
      <header className="mb-6 px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon mb-1">
          Explore
        </p>
        <h2
          id="dive-site-mapping-heading"
          className="text-2xl font-display font-bold text-maldives-deep"
        >
          Dive Site Mapping
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
          A live clustered map of curated Maldives sites, paired with an
          open-data workflow for building your own bathymetric overlays in QGIS.
        </p>
      </header>

      {/* Mobile-first: stack on < md, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* MAP CARD */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div
            className="relative w-full"
            style={{ height: 480 }}
          >
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-maldives-lagoon" />
                </div>
              }
            >
              <DiveSiteClusterMap />
            </Suspense>
          </div>

          {/* Legend — separate from the map so it never blocks markers */}
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

        {/* QGIS / BATHYMETRY EXPLAINER */}
        <div className="lg:col-span-2">
          <BathymetryExplainer />
        </div>
      </div>
    </section>
  );
}
