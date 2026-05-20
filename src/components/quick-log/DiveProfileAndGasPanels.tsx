import { DiveLog } from '../../types';
import { cn } from '../../lib/utils';
import { useObservationCatalog } from '../../hooks/useObservationCatalog';

interface DiveProfilePanelProps {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
}

export function DiveProfilePanel({ formData, setFormData }: DiveProfilePanelProps) {
  const { catalog } = useObservationCatalog();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dive Profile</h2>
        <p className="text-slate-500 mb-6 font-medium">Essential stats for your log</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Depth</label>
          <input 
            type="number"
            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xl font-bold text-center"
            value={formData.maxDepth}
            onChange={(e) => setFormData({ ...formData, maxDepth: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Depth</label>
          <input 
            type="number"
            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xl font-bold text-center"
            value={formData.avgDepth}
            onChange={(e) => setFormData({ ...formData, avgDepth: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</label>
          <input 
            type="number"
            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xl font-bold text-center"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</label>
          <input 
            type="date"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Start Time</label>
          <input 
            type="time"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Water Temp (°C)</label>
          <input 
            type="number"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none"
            value={formData.waterTemp}
            onChange={(e) => {
              const value = Number(e.target.value);
              setFormData({
                ...formData,
                waterTemp: value,
                siteConditions: {
                  ...formData.siteConditions,
                  current: formData.current || 'unknown',
                  waterTempC: value,
                  reportTime: formData.siteConditions?.reportTime || new Date().toISOString(),
                },
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Visibility (m)</label>
          <input 
            type="number"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none"
            value={formData.visibility}
            onChange={(e) => {
              const value = Number(e.target.value);
              setFormData({
                ...formData,
                visibility: value,
                siteConditions: {
                  ...formData.siteConditions,
                  current: formData.current || 'unknown',
                  visibilityMeters: value,
                  reportTime: formData.siteConditions?.reportTime || new Date().toISOString(),
                },
              });
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Strength</label>
        <div className="flex gap-2 flex-wrap">
          {catalog.currentStrength.length === 0 && (
            <p className="text-xs text-slate-400">Current options are not configured yet.</p>
          )}
          {catalog.currentStrength.map(s => (
            <button
              key={s}
              onClick={() =>
                setFormData({
                  ...formData,
                  current: s,
                  siteConditions: {
                    ...formData.siteConditions,
                    current: s,
                    reportTime: formData.siteConditions?.reportTime || new Date().toISOString(),
                  },
                })
              }
              className={cn(
                "px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                formData.current === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 border-t border-slate-100 pt-6">
        <div>
          <h3 className="font-bold text-maldives-deep">Site Conditions</h3>
          <p className="text-xs text-slate-500 mt-1">
            These details help future divers read recent site safety.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Surge</label>
          <div className="flex gap-2 flex-wrap">
            {catalog.surge.length === 0 && (
              <p className="text-xs text-slate-400">Surge options are not configured yet.</p>
            )}
            {catalog.surge.map((surge) => (
              <button
                key={surge}
                onClick={() =>
                  setFormData({
                    ...formData,
                    siteConditions: {
                      ...formData.siteConditions,
                      current: formData.current || 'unknown',
                      surge,
                      reportTime: formData.siteConditions?.reportTime || new Date().toISOString(),
                    },
                  })
                }
                className={cn(
                  'px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                  formData.siteConditions?.surge === surge
                    ? 'bg-maldives-lagoon text-white'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                {surge}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Entry / Exit
          </label>
          <select
            className="w-full p-4 bg-slate-50 rounded-2xl border-none appearance-none font-medium capitalize"
            value={formData.siteConditions?.entryExitDifficulty || 'manageable'}
            onChange={(e) =>
              setFormData({
                ...formData,
                siteConditions: {
                  ...formData.siteConditions,
                  current: formData.current || 'unknown',
                  entryExitDifficulty: e.target.value as any,
                  reportTime: formData.siteConditions?.reportTime || new Date().toISOString(),
                },
              })
            }
          >
            {catalog.entryExitDifficulty.length === 0 && (
              <option value="">Entry / exit options not configured</option>
            )}
            {catalog.entryExitDifficulty.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hazards Noted
          </label>
          <div className="flex gap-2 flex-wrap">
            {catalog.hazards.length === 0 && (
              <p className="text-xs text-slate-400">Hazard options are not configured yet.</p>
            )}
            {catalog.hazards.map((hazard) => {
              const hazards = formData.siteConditions?.hazards || [];
              const selected = hazards.includes(hazard);
              return (
                <button
                  key={hazard}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      siteConditions: {
                        ...formData.siteConditions,
                        current: formData.current || 'unknown',
                        hazards: selected
                          ? hazards.filter((item) => item !== hazard)
                          : [...hazards, hazard],
                        reportTime: formData.siteConditions?.reportTime || new Date().toISOString(),
                      },
                    })
                  }
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all',
                    selected ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {hazard}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Optional hazard note"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none"
            value={formData.siteConditions?.hazardNotes || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                siteConditions: {
                  ...formData.siteConditions,
                  current: formData.current || 'unknown',
                  hazardNotes: e.target.value,
                  reportTime: formData.siteConditions?.reportTime || new Date().toISOString(),
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

interface GasPressurePanelProps {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
  calculateSAC: () => number | undefined;
}

export function GasPressurePanel({ formData, setFormData, calculateSAC }: GasPressurePanelProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gas & Pressure</h2>
        <p className="text-slate-500 mb-6 font-medium">Auto-calculates your consumption</p>
      </div>

       <div className="grid grid-cols-2 gap-4">
         <button 
           onClick={() => setFormData({ ...formData, gasType: 'air', oxygenPercent: 21 })}
           className={cn(
             "p-4 rounded-2xl border font-bold transition-all",
             formData.gasType === 'air' ? "border-maldives-lagoon bg-maldives-shallow/20" : "border-slate-100"
           )}
         >
           Air (21%)
         </button>
         <button 
           onClick={() => setFormData({ ...formData, gasType: 'nitrox', oxygenPercent: 32 })}
           className={cn(
             "p-4 rounded-2xl border font-bold transition-all",
             formData.gasType === 'nitrox' ? "border-maldives-lagoon bg-maldives-shallow/20" : "border-slate-100"
           )}
         >
           Nitrox
         </button>
      </div>

      {formData.gasType === 'nitrox' && (
        <div className="animate-in zoom-in-95 duration-200">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Oxygen %</label>
          <input 
            type="number"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold"
            value={formData.oxygenPercent}
            onChange={(e) => setFormData({ ...formData, oxygenPercent: Number(e.target.value) })}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Start (bar)</label>
          <input 
            type="number"
            className="w-full p-6 bg-slate-50 border-none rounded-2xl text-2xl font-bold text-center"
            value={formData.startPressure}
            onChange={(e) => setFormData({ ...formData, startPressure: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">End (bar)</label>
          <input 
            type="number"
            className="w-full p-6 bg-slate-50 border-none rounded-2xl text-2xl font-bold text-center"
            value={formData.endPressure}
            onChange={(e) => setFormData({ ...formData, endPressure: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tank Size</span>
          <div className="flex gap-2">
            {[10, 12, 15].map(size => (
              <button
                key={size}
                onClick={() => setFormData({ ...formData, tankSize: size })}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold",
                  formData.tankSize === size ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                )}
              >
                {size}L
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-slate-200 pt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. SAC</span>
          <span className="text-xl font-bold text-maldives-lagoon">{calculateSAC() || '--'} <span className="text-xs font-normal text-slate-400">L/min</span></span>
        </div>
      </div>
    </div>
  );
}
