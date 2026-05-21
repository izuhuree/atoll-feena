interface ActivityMapPoint {
  id: string;
  name: string;
  atoll: string;
  lat: number;
  lng: number;
  reports: number;
}

export function MaldivesActivityMap({ points }: { points: ActivityMapPoint[] }) {
  const fallbackAtolls = [
    { x: 59, y: 13, r: 8, label: 'North' },
    { x: 51, y: 26, r: 10, label: 'Baa' },
    { x: 57, y: 40, r: 12, label: 'Malé' },
    { x: 49, y: 55, r: 11, label: 'Ari' },
    { x: 54, y: 70, r: 11, label: 'Laamu' },
    { x: 44, y: 88, r: 8, label: 'Addu' },
  ];
  const projectedPoints = points
    .map((point) => ({
      ...point,
      x: 18 + ((point.lng - 72.55) / 1.55) * 64,
      y: 8 + ((7.15 - point.lat) / 7.7) * 86,
    }))
    .filter((point) => point.x >= 8 && point.x <= 92 && point.y >= 4 && point.y <= 98);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-70 sm:w-[64%]">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id="mapGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M63 1 C53 12 58 23 50 34 C42 45 55 56 45 69 C37 80 42 91 34 100"
          fill="none"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="1 5"
        />
        {fallbackAtolls.map((atoll) => (
          <g key={atoll.label} filter="url(#mapGlow)">
            <ellipse
              cx={atoll.x}
              cy={atoll.y}
              rx={atoll.r}
              ry={atoll.r * 0.48}
              fill="rgba(14,165,167,0.16)"
              stroke="rgba(255,255,255,0.58)"
              strokeWidth="1.1"
              transform={`rotate(-22 ${atoll.x} ${atoll.y})`}
            />
            <ellipse
              cx={atoll.x}
              cy={atoll.y}
              rx={atoll.r * 0.55}
              ry={atoll.r * 0.22}
              fill="none"
              stroke="rgba(187,247,208,0.44)"
              strokeWidth="0.8"
              transform={`rotate(-22 ${atoll.x} ${atoll.y})`}
            />
            <circle cx={atoll.x - 1.5} cy={atoll.y + 0.3} r="1.8" fill="rgba(255,255,255,0.78)" />
            <text
              x={atoll.x + atoll.r * 0.55}
              y={atoll.y + 1}
              fill="rgba(255,255,255,0.58)"
              fontSize="3.2"
              fontWeight="700"
            >
              {atoll.label}
            </text>
          </g>
        ))}
        {projectedPoints.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r={Math.min(5, 2 + point.reports * 0.45)} fill="rgba(255,255,255,0.24)" />
            <circle cx={point.x} cy={point.y} r={Math.min(2.8, 1.2 + point.reports * 0.2)} fill="rgba(187,247,208,0.95)" />
          </g>
        ))}
      </svg>
    </div>
  );
}
