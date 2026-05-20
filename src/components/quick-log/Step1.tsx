import { Atoll, DiveLog } from '../../types';
import { cn } from '../../lib/utils';
import { Check, MapPin } from 'lucide-react';
import { useDiveSites } from '../../hooks/useDiveSites';

interface Step1Props {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
  onNext: () => void;
}

export function Step1({ formData, setFormData, onNext }: Step1Props) {
  const { allSites } = useDiveSites();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2">Where did you dive?</h2>
        <p className="text-slate-500 mb-6 font-medium">Select a site or enter a new one</p>
        
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Dive Site</label>
          <div className="relative">
            <select 
              className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 appearance-none font-bold text-maldives-deep"
              value={formData.siteId || ''}
              onChange={(e) => {
                const selectedSite = allSites.find(s => s.id === e.target.value);
                if (selectedSite) {
                  setFormData({ 
                    ...formData, 
                    siteId: selectedSite.id, 
                    atoll: selectedSite.atoll, 
                    customSiteName: selectedSite.name 
                  });
                  setTimeout(onNext, 500);
                } else if (e.target.value === 'custom') {
                  setFormData({ ...formData, siteId: 'custom' });
                }
              }}
            >
              <option value="" disabled>Choose a site...</option>
              {allSites.map(site => (
                <option key={site.id} value={site.id}>{site.name} ({site.atoll})</option>
              ))}
              <option value="custom">+ Other / New Site</option>
            </select>
            <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-maldives-lagoon w-5 h-5 pointer-events-none" />
          </div>

          {(formData.siteId === 'custom' || !formData.siteId) && (
            <div className="relative animate-in slide-in-from-top-2 duration-300">
              <input 
                type="text"
                placeholder="Enter Custom Site Name"
                className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20"
                value={formData.customSiteName || ''}
                onChange={(e) => setFormData({ ...formData, customSiteName: e.target.value, siteId: 'custom' })}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Atoll</label>
          <select 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none appearance-none"
            value={formData.atoll}
            onChange={(e) => setFormData({ ...formData, atoll: e.target.value as Atoll })}
          >
            <option>North Malé</option>
            <option>South Malé</option>
            <option>North Ari</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Island</label>
          <input 
            type="text"
            placeholder="Resort/Local"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none"
            value={formData.island}
            onChange={(e) => setFormData({ ...formData, island: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
