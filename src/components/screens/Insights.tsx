import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  ChevronLeft, 
  Trophy, 
  Waves, 
  Clock, 
  Navigation2,
  Fish,
  PlusCircle
} from 'lucide-react';
import { useDives } from '../../hooks/useDives';

interface InsightsProps {
  onBack: () => void;
  onLogDive?: () => void;
}

export function Insights({ onBack, onLogDive }: InsightsProps) {
  const { dives } = useDives();

  if (dives.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-11 h-11 flex items-center justify-center bg-slate-50 rounded-full active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-display font-bold text-maldives-deep">Your Insights</h1>
        </header>
        <div className="px-6 py-16 text-center">
          <div className="w-20 h-20 bg-maldives-shallow/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <Waves className="text-maldives-lagoon w-10 h-10" />
          </div>
          <h2 className="font-display font-bold text-xl text-maldives-deep mb-2">
            No insights yet
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
            Log a few dives and we'll show you trends — depth, air efficiency and
            the marine life you spot most.
          </p>
          {onLogDive && (
            <button
              onClick={onLogDive}
              className="inline-flex items-center gap-2 px-6 py-3 bg-maldives-deep text-white rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-slate-200"
            >
              <PlusCircle className="w-4 h-4" /> Log my first dive
            </button>
          )}
        </div>
      </div>
    );
  }

  // Actual data calculations
  const depthCategories = [
    { name: '0-10m', min: 0, max: 10, count: 0 },
    { name: '10-20m', min: 10, max: 20, count: 0 },
    { name: '20-30m', min: 20, max: 30, count: 0 },
    { name: '30m+', min: 30, max: 200, count: 0 },
  ];

  dives.forEach(d => {
    const cat = depthCategories.find(c => d.maxDepth >= c.min && d.maxDepth < c.max);
    if (cat) cat.count++;
  });

  const sacTrend = dives
    .filter(d => d.sac)
    .slice(0, 10)
    .reverse()
    .map((d, i) => ({
      name: `D${i + 1}`,
      sac: d.sac
    }));

  const marineLifeSightings: Record<string, number> = {};
  dives.forEach(d => {
    d.marineLife.forEach(m => {
      marineLifeSightings[m] = (marineLifeSightings[m] || 0) + 1;
    });
  });

  const marineLifeStats = Object.entries(marineLifeSightings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }));

  const totalTimeHours = Math.round(dives.reduce((acc, d) => acc + d.duration, 0) / 60);
  const deepestDive = dives.length > 0 ? Math.max(...dives.map(d => d.maxDepth)) : 0;
  const longestDive = dives.length > 0 ? Math.max(...dives.map(d => d.duration)) : 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-display font-bold text-maldives-deep">Your Insights</h1>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* Top Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="p-2 bg-maldives-shallow/20 rounded-xl w-fit mb-3">
              <Clock className="w-5 h-5 text-maldives-lagoon" />
            </div>
            <p className="text-4xl font-display font-bold mb-1 text-maldives-deep">{totalTimeHours}h</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Bottom Time</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="p-2 bg-orange-50 rounded-xl w-fit mb-3">
              <Navigation2 className="text-orange-500 w-5 h-5" />
            </div>
            <p className="text-4xl font-display font-bold mb-1 text-maldives-deep">{dives.length}</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Dives</p>
          </div>
        </section>

        {/* Charts */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-6 text-lg">Depth Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depthCategories}>
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="var(--color-maldives-lagoon)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* SAC TREND */}
        {sacTrend.length > 0 && (
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-2 text-lg">Air Efficiency</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">SAC Rate Trend (Last 10 Dives)</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sacTrend}>
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="sac" fill="var(--color-maldives-turquoise)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Marine Life Counts */}
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Marine Sightings</h3>
          {marineLifeStats.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {marineLifeStats.map((stat) => (
                <div key={stat.name} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-maldives-shallow/20 rounded-2xl flex items-center justify-center mb-3 text-maldives-lagoon">
                    <Fish className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-display font-bold text-maldives-deep">{stat.count}</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-tight">{stat.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-slate-400 text-sm">No marine life logged yet.</p>
          )}
        </section>

        {/* Records */}
        <section className="bg-slate-900 rounded-3xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="font-bold text-lg">Personal Bests</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <p className="text-slate-400 text-sm">Deepest Dive</p>
              <p className="text-2xl font-display font-bold text-maldives-turquoise">{deepestDive}m</p>
            </div>
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <p className="text-slate-400 text-sm">Longest Dive</p>
              <p className="text-2xl font-display font-bold text-maldives-turquoise">{longestDive} min</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
