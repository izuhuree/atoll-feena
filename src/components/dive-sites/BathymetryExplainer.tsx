import { Download, Layers, MapPin, FileImage, GitBranch } from 'lucide-react';

/**
 * Static, side-by-side explainer card for the QGIS / GEBCO bathymetry workflow.
 * Purely SVG + Tailwind — no map library — so it stays light, theme-able,
 * and printable.
 */

interface DepthZone {
  label: string;
  range: string;
  // top/bottom % of the gradient bar this band covers
  start: number;
  end: number;
  relevance: string;
  swatch: string;
}

const ZONES: DepthZone[] = [
  {
    label: 'Shallow Reef',
    range: '0–60 m',
    start: 0,
    end: 25,
    relevance: 'Primary zone for DIVR coral health logging',
    swatch: '#bae6fd',
  },
  {
    label: 'Mesophotic',
    range: '60–200 m',
    start: 25,
    end: 45,
    relevance: 'Twilight reefs — eDNA & ROV citizen surveys',
    swatch: '#67e8f9',
  },
  {
    label: 'Deep Reef',
    range: '200–3,000 m',
    start: 45,
    end: 75,
    relevance: 'GEBCO contour zone for shelf-edge mapping',
    swatch: '#0891b2',
  },
  {
    label: 'Abyssal',
    range: '> 3,000 m',
    start: 75,
    end: 100,
    relevance: 'Reference layer — not divable, used for context',
    swatch: '#075985',
  },
];

const STEPS = [
  { icon: Download, title: 'Download GEBCO', detail: 'Grab the latest GEBCO global bathymetry GeoTIFF — free, public-domain.' },
  { icon: Layers, title: 'Load into QGIS', detail: 'Drop the raster layer onto a fresh project; QGIS is open-source (GPL).' },
  { icon: GitBranch, title: 'Style contours', detail: 'Apply a single-band pseudocolor ramp matching the depth zones at left.' },
  { icon: MapPin, title: 'Overlay dive sites', detail: 'Import your logbook GPS points as a CSV layer or KML.' },
  { icon: FileImage, title: 'Export', detail: 'Render to PNG for reports, or KML/MBTiles for offline use in the app.' },
];

export function BathymetryExplainer() {
  return (
    <div className="h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <header className="p-6 pb-4 border-b border-slate-50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon mb-1">
          Open-data workflow
        </p>
        <h3 className="text-xl font-display font-bold text-maldives-deep">
          Bathymetric Layers with QGIS
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          GEBCO global bathymetry is free public-domain data — load it into QGIS
          to render contour maps for reef monitoring and overlay your own dive
          GPS points.
        </p>
      </header>

      <div className="flex-1 grid grid-rows-[1fr_auto] gap-0">
        {/* Depth gradient + zone legend */}
        <div className="grid grid-cols-[64px_1fr] gap-4 p-6 pb-3">
          {/* SVG gradient strip — drawn so we don't ship a binary image */}
          <div className="relative">
            <svg
              viewBox="0 0 24 200"
              preserveAspectRatio="none"
              className="w-full h-full rounded-2xl shadow-inner"
              role="img"
              aria-label="Ocean depth gradient, light blue at the surface to deep navy at depth"
            >
              <defs>
                <linearGradient id="depth-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f0f9ff" />
                  <stop offset="25%" stopColor="#bae6fd" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="75%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#0c2d4a" />
                </linearGradient>
              </defs>
              <rect
                x="0"
                y="0"
                width="24"
                height="200"
                fill="url(#depth-gradient)"
              />
            </svg>
            {/* Tick marks aligned to zone boundaries */}
            <div className="absolute inset-y-0 -right-2 flex flex-col">
              {ZONES.map((zone) => (
                <div
                  key={zone.label}
                  className="flex-1 border-t border-white/40 first:border-t-0"
                  style={{ flexGrow: zone.end - zone.start }}
                />
              ))}
            </div>
          </div>

          <ul className="flex flex-col justify-between text-xs">
            {ZONES.map((zone) => (
              <li key={zone.label} className="flex items-start gap-3 py-1">
                <span
                  aria-hidden
                  className="mt-1 w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ background: zone.swatch }}
                />
                <div>
                  <p className="font-semibold text-maldives-deep text-[13px] leading-tight">
                    {zone.label}{' '}
                    <span className="text-slate-400 font-medium">
                      {zone.range}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {zone.relevance}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Workflow */}
        <ol className="border-t border-slate-50 px-6 py-4 grid gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            5-step workflow
          </p>
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-maldives-lagoon/10 text-maldives-lagoon flex items-center justify-center text-[11px] font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-maldives-deep flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-maldives-lagoon" />
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
