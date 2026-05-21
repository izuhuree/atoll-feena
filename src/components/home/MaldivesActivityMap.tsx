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
    { x: 58, y: 18, r: 9 },
    { x: 50, y: 31, r: 11 },
    { x: 54, y: 45, r: 13 },
    { x: 47, y: 60, r: 10 },
    { x: 52, y: 75, r: 12 },
    { x: 45, y: 89, r: 9 },
  ];
  const projectedPoints = points
    .map((point) => ({
      ...point,
      x: 18 + ((point.lng - 72.55) / 1.55) * 64,
      y: 8 + ((7.15 - point.lat) / 7.7) * 86,
    }))
    .filter((point) => point.x >= 8 && point.x <= 92 && point.y >= 4 && point.y <= 98);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-45 sm:w-[58%]">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path
          d="M62 4 C48 17 57 30 48 42 C40 53 54 64 43 77 C37 85 42 94 33 100"
          fill="none"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="0.8"
          strokeDasharray="2 4"
        />
        {fallbackAtolls.map((atoll) => (
          <g key={`${atoll.x}-${atoll.y}`}>
            <ellipse
              cx={atoll.x}
              cy={atoll.y}
              rx={atoll.r}
              ry={atoll.r * 0.42}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.8"
              transform={`rotate(-22 ${atoll.x} ${atoll.y})`}
            />
            <circle cx={atoll.x - 1} cy={atoll.y} r="1.2" fill="rgba(255,255,255,0.28)" />
          </g>
        ))}
        {projectedPoints.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r={Math.min(5, 2 + point.reports * 0.45)} fill="rgba(255,255,255,0.2)" />
            <circle cx={point.x} cy={point.y} r={Math.min(2.8, 1.2 + point.reports * 0.2)} fill="rgba(187,247,208,0.9)" />
          </g>
        ))}
      </svg>
    </div>
  );
}
