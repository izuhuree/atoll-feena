import { DiveLog } from '../../types';
import { cn } from '../../lib/utils';
import { Clock, Thermometer, Star, Check, Waves, Image as ImageIcon } from 'lucide-react';

interface Step6Props {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
  calculateSAC: () => number | undefined;
}

export function Step6({ formData, setFormData, calculateSAC }: Step6Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ready to Save?</h2>
        <p className="text-slate-500 mb-6 font-medium">Review your dive at {formData.customSiteName || 'Unknown Site'}</p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl">
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Max Depth</p>
            <p className="text-5xl font-bold">{formData.maxDepth}<span className="text-xl font-normal opacity-50 ml-1">m</span></p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Time</p>
            <p className="text-5xl font-bold">{formData.duration}<span className="text-xl font-normal opacity-50 ml-1">min</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 opacity-80">
            <Clock className="w-4 h-4" /> {formData.startTime}
          </div>
          <div className="flex items-center gap-2 opacity-80 justify-end">
            <Thermometer className="w-4 h-4" /> {formData.waterTemp}°C
          </div>
        </div>

         <div className="flex justify-between items-center py-2 bg-white/5 rounded-xl px-4">
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">SAC RATE</span>
           <span className="font-mono text-maldives-turquoise font-bold">{calculateSAC() || '0.00'} L/min</span>
        </div>

        {formData.media && formData.media.length > 0 && (
          <div className="flex justify-between items-center py-2 bg-white/5 rounded-xl px-4">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Attached Media</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-maldives-turquoise">{formData.media.length} items</span>
              <ImageIcon className="w-3 h-3 text-maldives-turquoise" />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
             <button 
               key={star}
               onClick={() => setFormData({ ...formData, rating: star })}
             >
               <Star className={cn("w-6 h-6", star <= (formData.rating || 0) ? "fill-maldives-turquoise text-maldives-turquoise" : "text-white/20")} />
             </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-maldives-shallow/20 p-6 rounded-3xl flex items-start gap-4 border border-maldives-shallow/30">
          <div className="bg-maldives-shallow/40 p-2 rounded-xl">
            <Check className="w-5 h-5 text-maldives-lagoon" />
          </div>
          <div>
            <h4 className="font-bold text-maldives-deep text-sm">Offline Capture ready</h4>
            <p className="text-maldives-lagoon/70 text-xs">This dive will be saved locally and synced once you have signal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
