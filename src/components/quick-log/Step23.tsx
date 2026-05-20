import { DiveLog, CurrentStrength } from '../../types';
import { cn } from '../../lib/utils';

interface Step2Props {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
}

export function Step2({ formData, setFormData }: Step2Props) {
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
            onChange={(e) => setFormData({ ...formData, waterTemp: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Visibility (m)</label>
          <input 
            type="number"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none"
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Strength</label>
        <div className="flex gap-2 flex-wrap">
          {(['none', 'mild', 'moderate', 'strong'] as CurrentStrength[]).map(s => (
            <button
              key={s}
              onClick={() => setFormData({ ...formData, current: s })}
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
    </div>
  );
}

interface Step3Props {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
  calculateSAC: () => number | undefined;
}

export function Step3({ formData, setFormData, calculateSAC }: Step3Props) {
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
