import { useState } from 'react';
import { useDives } from '../../hooks/useDives';
import { 
  MapPin, 
  Clock, 
  TrendingDown, 
  Share2, 
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Waves,
  Users,
  Building,
  Anchor,
  Play,
  Image as ImageIcon,
  PlusCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface LogbookProps {
  onLogDive?: () => void;
}

export function Logbook({ onLogDive }: LogbookProps = {}) {
  const { dives, loading } = useDives();
  const [expandedDiveId, setExpandedDiveId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maldives-lagoon"></div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedDiveId(expandedDiveId === id ? null : id);
  };

  const exportCSV = () => {
    if (dives.length === 0) return;
    
    const headers = [
      'Dive #', 'Date', 'Time', 'Site', 'Atoll', 'Max Depth (m)', 'Duration (min)', 
      'SAC (L/min)', 'Gas', 'O2%', 'Temp (°C)', 'Visibility (m)', 'Current', 'Rating', 'Notes'
    ];
    
    const rows = dives.map(d => [
      d.diveNumber, d.date, d.startTime, d.customSiteName, d.atoll, d.maxDepth, d.duration,
      d.sac || '', d.gasType, d.oxygenPercent, d.waterTemp || '', d.visibility || '', d.current, d.rating, d.notes.replace(/"/g, '""')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `AtollFeeNa_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-6 pt-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1 text-maldives-deep">Logbook</h1>
          <p className="text-slate-500 text-sm">
            {dives.length === 0 ? 'No dives yet' : `${dives.length} ${dives.length === 1 ? 'dive' : 'dives'} recorded`}
          </p>
        </div>
        {dives.length > 0 && (
          <div className="flex gap-2">
            <button
              aria-label="Search dives"
              className="w-11 h-11 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 active:scale-95 transition-transform flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={exportCSV}
              aria-label="Export as CSV"
              className="w-11 h-11 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 active:scale-95 transition-transform flex items-center justify-center"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {dives.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-maldives-shallow/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <Waves className="text-maldives-lagoon w-10 h-10" />
          </div>
          <h3 className="font-display font-bold text-xl text-maldives-deep mb-2">
            Your logbook is empty
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
            Every dive you log builds your underwater story — depths, sightings, and
            memories.
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
      ) : (
        <div className="space-y-8">
          {dives.map((dive) => {
            const date = new Date(dive.date);
            const formattedDate = format(date, 'MMM do, yyyy');
            const isExpanded = expandedDiveId === dive.id;
            
            return (
              <div key={dive.id} className="relative pl-8 pb-8 border-l border-slate-100 last:pb-0">
                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-maldives-lagoon rounded-full border-4 border-white shadow-sm ring-1 ring-maldives-shallow" />
                
                <div 
                  onClick={() => toggleExpand(dive.id)}
                  className={cn(
                    "bg-white rounded-3xl p-6 border transition-all cursor-pointer",
                    isExpanded ? "shadow-xl border-maldives-shallow ring-1 ring-maldives-shallow/50" : "border-slate-100 shadow-sm hover:border-slate-200"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Dive #{dive.diveNumber}</p>
                      <h3 className="font-display font-bold text-xl leading-tight text-maldives-deep">{dive.customSiteName || 'Unknown Site'}</h3>
                      <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-maldives-lagoon" /> {dive.atoll}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">{formattedDate}</p>
                      <div className="flex gap-1 justify-end">
                        {Array.from({ length: dive.rating }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-maldives-lagoon rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-maldives-shallow/10 p-4 rounded-2xl border border-maldives-shallow/20">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-3 h-3 text-maldives-lagoon" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Depth</span>
                      </div>
                      <p className="text-xl font-display font-bold text-maldives-deep">{dive.maxDepth}<span className="text-xs font-medium ml-0.5 opacity-40">m</span></p>
                    </div>
                    <div className="bg-maldives-shallow/10 p-4 rounded-2xl border border-maldives-shallow/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-maldives-lagoon" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</span>
                      </div>
                      <p className="text-xl font-display font-bold text-maldives-deep">{dive.duration}<span className="text-xs font-medium ml-0.5 opacity-40">min</span></p>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-y-4">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Entry Time</p>
                            <p className="font-bold text-sm">{dive.startTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Thermometer className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Water Temp</p>
                            <p className="font-bold text-sm">{dive.waterTemp || '--'}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Waves className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Visibility</p>
                            <p className="font-bold text-sm">{dive.visibility || '--'}m</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Anchor className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Current</p>
                            <p className="font-bold text-sm capitalize">{dive.current}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pressure (Start / End)</p>
                          <p className="font-mono text-xs font-bold text-slate-700">
                            {dive.startPressure || '--'} bar / {dive.endPressure || '--'} bar
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SAC Rate</p>
                          <p className="font-bold text-maldives-lagoon text-lg">{dive.sac || '--'} <span className="text-[10px] font-normal text-slate-400 uppercase">L/min</span></p>
                        </div>
                      </div>

                      {(dive.buddyNames?.length || 0) > 0 && (
                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Buddy Team</p>
                            <p className="text-sm font-medium">{dive.buddyNames?.join(', ')}</p>
                          </div>
                        </div>
                      )}

                      {dive.diveCenter && (
                        <div className="flex items-start gap-3">
                          <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Dive Center</p>
                            <p className="text-sm font-medium">{dive.diveCenter}</p>
                          </div>
                        </div>
                      )}

                      {dive.notes && (
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                          <p className="text-sm text-slate-600 leading-relaxed italic">"{dive.notes}"</p>
                        </div>
                      )}

                      {dive.media && dive.media.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Media Gallery</p>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {dive.media.map(item => (
                              <div key={item.id} className="relative flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                                {item.type === 'image' ? (
                                  <img src={item.url} alt="Dive" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-white opacity-80" />
                                    <video className="hidden" src={item.url} />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md p-1 rounded-lg">
                                  {item.type === 'image' ? <ImageIcon className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                       {dive.marineLife.map(life => (
                        <span key={life} className="bg-maldives-shallow/30 text-maldives-deep px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          {life}
                        </span>
                      ))}
                      {dive.gasType === 'nitrox' && (
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          Nitrox {dive.oxygenPercent}%
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dives.length > 0 && (
        <div className="mt-12 mb-10">
          <button className="w-full py-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-center gap-3 text-slate-600 font-bold shadow-sm active:scale-95 transition-transform">
            <FileText className="w-5 h-5 text-maldives-lagoon" />
            Export Logbook (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
