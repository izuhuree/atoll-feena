import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  TrendingDown, 
  Accessibility,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface WatchPreviewProps {
  onBack: () => void;
}

export function WatchPreview({ onBack }: WatchPreviewProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white pt-16 pb-20 px-8">
       <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ChevronLeft className="w-5 h-5" /> Back to Profile
      </button>

      <div className="max-w-xs mx-auto space-y-12">
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Watch Ultra</h2>
            <span className="bg-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            AtollFeeNa Companion for Apple Watch Ultra focuses on post-dive capture and glanceable site info.
          </p>
        </section>

        {/* Watch Mockup */}
        <div className="relative mx-auto w-64 h-80 bg-black rounded-[48px] border-[10px] border-slate-800 shadow-2xl flex flex-col p-6 overflow-hidden ring-4 ring-orange-500/20">
          {/* Surface Note Screen */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Banana Reef</span>
              <span className="text-[10px] font-medium opacity-50">N. Malé</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-[8px] font-bold">45%</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center text-slate-400">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
              </div>
              <p className="text-4xl font-black tabular-nums">48:12</p>
            </div>

            <div className="w-full grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-900 rounded-2xl flex flex-col items-center">
                <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest mb-1">Max</span>
                <p className="text-lg font-bold">22.4m</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl flex flex-col items-center">
                <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest mb-1">Temp</span>
                <p className="text-lg font-bold">29°C</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 bg-orange-500 rounded-2xl text-[12px] font-black uppercase tracking-widest mt-4 active:scale-95 transition-transform shadow-lg shadow-orange-500/20">
            Log Dive Note
          </button>
        </div>

        <section className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Offline Logging</h4>
              <p className="text-slate-500 text-xs">Logs drafts on your wrist, syncs to iPhone automatically when back in range.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Safety Note</h4>
              <p className="text-slate-500 text-xs">AtollFeeNa companion is not a dive computer. Use certified equipment underwater.</p>
            </div>
          </div>
        </section>

        <button className="w-full py-4 border border-slate-700 rounded-3xl text-sm font-bold active:bg-slate-800 transition-colors">
          Pair with AtollFeeNa on Watch
        </button>
      </div>
    </div>
  );
}
