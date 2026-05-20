import { DiveSite } from '../../types';

interface SiteSketchSvgProps {
  site: DiveSite;
}

/**
 * Procedural top-down sketch of a dive site. Renders a different stylised
 * shape based on the site's type / name keywords. This is the always-available
 * fallback when no AI sketch has been generated yet; it never hallucinates
 * because every shape is derived from real `DiveSite` fields.
 */
export function SiteSketchSvg({ site }: SiteSketchSvgProps) {
  const t = `${site.type} ${site.name}`.toLowerCase();
  const shape: 'thila' | 'channel' | 'wreck' | 'wall' | 'reef' = t.includes('wreck')
    ? 'wreck'
    : t.includes('kandu') || t.includes('channel') || t.includes('drift') || t.includes('express')
      ? 'channel'
      : t.includes('wall') || t.includes('corner') || t.includes('faru')
        ? 'wall'
        : t.includes('thila') || t.includes('giri') || t.includes('rock') || t.includes('head')
          ? 'thila'
          : 'reef';

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Top-down sketch of ${site.name} — a ${shape}`}
      className="w-full h-full"
    >
      <defs>
        <radialGradient id="water" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </radialGradient>
        <pattern
          id="ripples"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0,20 Q10,10 20,20 T40,20"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.6"
            opacity="0.25"
          />
        </pattern>
      </defs>

      {/* Ocean background */}
      <rect width="400" height="400" fill="url(#water)" />
      <rect width="400" height="400" fill="url(#ripples)" />

      {/* Site shape */}
      {shape === 'thila' && (
        <g>
          <ellipse cx="200" cy="200" rx="120" ry="80" fill="#fef3c7" stroke="#92400e" strokeWidth="2" opacity="0.85" />
          <ellipse cx="200" cy="200" rx="80" ry="50" fill="#fbbf24" opacity="0.5" />
          <circle cx="200" cy="200" r="20" fill="#92400e" opacity="0.4" />
        </g>
      )}

      {shape === 'channel' && (
        <g>
          <path
            d="M 0 120 Q 100 100 200 130 T 400 120 L 400 0 L 0 0 Z"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
            opacity="0.9"
          />
          <path
            d="M 0 280 Q 100 300 200 270 T 400 280 L 400 400 L 0 400 Z"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
            opacity="0.9"
          />
          {/* Current arrows */}
          <g stroke="#075985" strokeWidth="2.5" fill="none" opacity="0.6">
            <path d="M 80 200 L 320 200 M 310 192 L 320 200 L 310 208" />
            <path d="M 80 230 L 320 230 M 310 222 L 320 230 L 310 238" strokeOpacity="0.4" />
          </g>
        </g>
      )}

      {shape === 'wreck' && (
        <g>
          <ellipse cx="200" cy="220" rx="140" ry="40" fill="#cbd5e1" opacity="0.5" />
          <path
            d="M 90 220 L 110 180 L 290 180 L 310 220 Z"
            fill="#475569"
            stroke="#1e293b"
            strokeWidth="2"
          />
          <rect x="180" y="150" width="40" height="32" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="135" y="165" width="20" height="18" fill="#334155" />
          <rect x="245" y="165" width="20" height="18" fill="#334155" />
        </g>
      )}

      {shape === 'wall' && (
        <g>
          <path
            d="M 0 0 L 220 0 Q 240 200 200 400 L 0 400 Z"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
            opacity="0.9"
          />
          <path
            d="M 220 0 Q 240 200 200 400"
            stroke="#92400e"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
            strokeDasharray="6 4"
          />
        </g>
      )}

      {shape === 'reef' && (
        <g>
          <path
            d="M 60 200 C 80 110 200 90 250 130 C 340 100 360 240 290 280 C 260 360 120 340 80 280 C 30 260 30 220 60 200 Z"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
            opacity="0.9"
          />
          <path
            d="M 110 220 C 130 170 200 170 230 200"
            stroke="#92400e"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 140 270 C 180 250 250 260 280 240"
            stroke="#92400e"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
        </g>
      )}

      {/* Compass rose */}
      <g transform="translate(345, 55)">
        <circle r="22" fill="#fff" opacity="0.85" />
        <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill="#0891b2" />
        <text y="-22" fontSize="9" textAnchor="middle" fill="#075985" fontWeight="700">N</text>
      </g>

      {/* Depth label */}
      <g transform="translate(20, 380)">
        <rect width="120" height="22" rx="11" fill="#fff" opacity="0.9" />
        <text x="60" y="15" fontSize="10" textAnchor="middle" fill="#075985" fontWeight="700">
          {site.depthMin}–{site.depthMax} m · {site.current}
        </text>
      </g>
    </svg>
  );
}
