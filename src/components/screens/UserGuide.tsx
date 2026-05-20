import { ChevronLeft, Info, Search, BookOpen, Map, Settings } from 'lucide-react';

interface UserGuideProps {
  onBack: () => void;
}

export function UserGuide({ onBack }: UserGuideProps) {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <img 
                src="/logo.png" 
                alt="" 
                className="w-4 h-4 rounded-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <h1 className="text-xl font-display font-bold text-maldives-deep">User Guide</h1>
            </div>
            <p className="text-[10px] font-bold text-maldives-turquoise uppercase tracking-widest leading-none mt-1">
              How to use AtollFeeNa
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-maldives-deep mb-3">About AtollFeeNa</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            AtollFeeNa is a premier diving logbook tailored for the Maldives. Record your dives, track marine life, and browse detailed topographical maps of local dive sites.
          </p>
        </div>

        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest ml-1 mt-8 mb-4">Core Features</h3>

        <div className="space-y-4">
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex gap-4">
            <div className="w-12 h-12 bg-maldives-lagoon/10 rounded-2xl flex items-center justify-center text-maldives-lagoon shrink-0 text-xl font-bold">
              1
            </div>
            <div>
              <h4 className="font-bold text-maldives-deep text-lg mb-1 flex items-center gap-2">
                Log a Dive
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tap the central + button (Quick Log) to instantly record your dive details, depth, duration, and the marine life you spotted.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex gap-4">
            <div className="w-12 h-12 bg-maldives-lagoon/10 rounded-2xl flex items-center justify-center text-maldives-lagoon shrink-0 text-xl font-bold">
              2
            </div>
            <div>
              <h4 className="font-bold text-maldives-deep text-lg mb-1 flex items-center gap-2">
                Explore Sites
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Browse the Sites tab to view topographic maps, currents, and popularity for famous Maldivian reefs and thilas.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex gap-4">
            <div className="w-12 h-12 bg-maldives-lagoon/10 rounded-2xl flex items-center justify-center text-maldives-lagoon shrink-0 text-xl font-bold">
              3
            </div>
            <div>
              <h4 className="font-bold text-maldives-deep text-lg mb-1 flex items-center gap-2">
                Field Guide
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Use the Encyclopedia (Field Guide) to identify marine life. You can mark which species you've seen and even upload your own photos.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex gap-4">
            <div className="w-12 h-12 bg-maldives-lagoon/10 rounded-2xl flex items-center justify-center text-maldives-lagoon shrink-0 text-xl font-bold">
              4
            </div>
            <div>
              <h4 className="font-bold text-maldives-deep text-lg mb-1 flex items-center gap-2">
                Sync Profile
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect your account in the Me tab to sync your dives securely across devices using your Google ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
