import { DiveSite } from '../../types';

interface DiveSiteMapProps {
  site: DiveSite;
}

export function DiveSiteMap({ site }: DiveSiteMapProps) {
  const normType = site.type.toLowerCase();
  const name = site.name.toLowerCase();

  const isBananaReef = site.id === 'banana-reef';
  const isThila =
    normType.includes('thila') ||
    normType.includes('giri') ||
    name.includes('thila') ||
    name.includes('rock') ||
    name.includes('head');
  const isChannel =
    normType.includes('kandu') ||
    normType.includes('channel') ||
    normType.includes('drift') ||
    name.includes('kandu') ||
    name.includes('express');
  const isWreck = normType.includes('wreck') || name.includes('wreck') || name.includes('victory');
  const isWall =
    normType.includes('wall') ||
    normType.includes('corner') ||
    name.includes('corner') ||
    name.includes('faru') ||
    normType.includes('reef');

  // 40m = 160Y. Cap the y at 150 to keep it visible.
  const maxDepthY = Math.min(150, site.depthMax * 4);

  return (
    <div className="mb-6 rounded-2xl overflow-hidden relative shadow-inner bg-gradient-to-b from-sky-100 via-sky-200 to-sky-300 border border-sky-100/50">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="water-wave" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0,10 Q5,5 10,10 T20,10" fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#water-wave)" />
        </svg>
      </div>

      <svg className="w-full h-32 relative z-10" viewBox="0 0 400 160" preserveAspectRatio="none">
        <line x1="0" y1="40" x2="400" y2="40" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <line x1="0" y1="80" x2="400" y2="80" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <line x1="0" y1="120" x2="400" y2="120" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <text x="390" y="44" fill="#0369a1" fontSize="10" textAnchor="end" opacity="0.8">
          10m
        </text>
        <text x="390" y="84" fill="#0369a1" fontSize="10" textAnchor="end" opacity="0.8">
          20m
        </text>
        <text x="390" y="124" fill="#0369a1" fontSize="10" textAnchor="end" opacity="0.8">
          30m
        </text>

        {isBananaReef && (
          <g>
            <path d="M 30 160 C 50 60, 200 30, 350 140 L 350 160 Z" fill="#ebf4ff" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 60 160 C 80 80, 190 50, 310 140 L 310 160 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          </g>
        )}

        {!isBananaReef && isThila && (
          <path
            d="M 50 160 L 100 100 C 130 60, 150 40, 200 40 C 250 40, 270 60, 300 100 L 350 160 Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="2"
          />
        )}

        {!isBananaReef && isChannel && (
          <g>
            <path d="M 0 160 L 0 50 L 100 50 C 130 50, 160 100, 160 160 Z" fill="#ebf4ff" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 400 160 L 400 50 L 300 50 C 270 50, 240 100, 240 160 Z" fill="#ebf4ff" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 170 80 L 230 80 M 220 75 L 230 80 L 220 85" stroke="#000000" strokeWidth="2" fill="none" opacity="0.2" />
            <path d="M 170 120 L 230 120 M 220 115 L 230 120 L 220 125" stroke="#000000" strokeWidth="2" fill="none" opacity="0.2" />
          </g>
        )}

        {!isBananaReef && isWreck && (
          <g>
            <path d="M 0 160 L 400 160 Z" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 100 160 L 120 120 L 280 120 L 300 160 Z" fill="#64748b" opacity="0.9" />
            <rect x="220" y="90" width="20" height="30" fill="#475569" />
            <rect x="150" y="100" width="15" height="20" fill="#475569" />
          </g>
        )}

        {!isBananaReef && isWall && <path d="M 0 160 L 0 20 L 120 20 C 140 20, 160 140, 200 160 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />}

        {!isBananaReef && !isThila && !isChannel && !isWreck && !isWall && (
          <path d="M 0 160 L 0 40 L 80 40 C 150 40, 200 140, 300 150 C 350 150, 400 160, 400 160 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        )}

        <circle cx="200" cy={maxDepthY} r="4" fill="#ef4444" className="animate-pulse" />
        <text x="210" y={maxDepthY + 4} fill="#ef4444" fontSize="12" fontWeight="bold">
          {site.depthMax}m Max
        </text>

        <circle cx="100" cy={Math.max(10, site.depthMin * 4)} r="3" fill="#10b981" />
        <text x="110" y={Math.max(10, site.depthMin * 4) + 3} fill="#10b981" fontSize="10" fontWeight="bold">
          {site.depthMin}m Top
        </text>

        <text x="10" y="15" fill="#0369a1" fontSize="10" fontWeight="bold" opacity="0.9">
          Type: {site.type.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
