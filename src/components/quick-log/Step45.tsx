import { useState, useEffect } from 'react';
import { DiveLog } from '../../types';
import { Search, Plus, Trash2, Camera, Film, Play, Image as ImageIcon, CameraOff } from 'lucide-react';
import { useMarineLife } from '../../hooks/useMarineLife';
import { cn } from '../../lib/utils';

interface Step4Props {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
  addSighting: (s: string) => void;
  removeSighting: (s: string) => void;
  triggerSightingPhoto: (s: string) => void;
  removeMedia: (id: string) => void;
}

export function Step4({ 
  formData, setFormData, 
  addSighting, removeSighting, triggerSightingPhoto, removeMedia
}: Step4Props) {
  const { allLife } = useMarineLife();
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('fee_na_field_guide_photos');
    if (saved) {
      try {
        setUserPhotos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse field guide photos', e);
      }
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sightings</h2>
        <p className="text-slate-500 mb-6 font-medium">Record what you saw and attach photos</p>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Species</label>
        <div className="relative">
          <select 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20 appearance-none font-bold text-maldives-deep"
            onChange={(e) => {
              if (e.target.value) {
                addSighting(e.target.value);
                e.target.value = '';
              }
            }}
            value=""
          >
            <option value="" disabled>Choose a creature...</option>
            {allLife.map(life => (
              <option key={life.id} value={life.name}>{life.name}</option>
            ))}
          </select>
          <Plus className="absolute right-4 top-1/2 -translate-y-1/2 text-maldives-lagoon w-5 h-5 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {formData.marineLife && formData.marineLife.length > 0 ? (
          formData.marineLife.map(species => {
            const dbEntry = allLife.find(l => l.name === species);
            const userPhoto = dbEntry ? userPhotos[dbEntry.id] : null;
            const speciesPhoto = formData.media?.find((m: any) => m.description === `Photo of ${species}`);
            
            const displayPhoto = speciesPhoto?.url || userPhoto || dbEntry?.imageUrl;

            return (
              <div key={species} className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center gap-4 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                  {displayPhoto ? (
                    <img src={displayPhoto} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                      <CameraOff className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-maldives-deep truncate">{species}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {dbEntry?.category || 'Sighting'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {speciesPhoto ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-maldives-lagoon">
                      <img src={speciesPhoto.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => removeMedia(speciesPhoto.id)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => triggerSightingPhoto(species)}
                      className="w-10 h-10 flex items-center justify-center bg-maldives-shallow/20 text-maldives-lagoon rounded-xl active:scale-90 transition-transform"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeSighting(species)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 rounded-xl hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-slate-300 w-8 h-8" />
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Search and select marine life to record your sightings.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-50">
         <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Buddy & Crew</label>
         <input 
           type="text"
           placeholder="Buddy Names"
           className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20"
           value={formData.buddyNames?.join(', ')}
           onChange={(e) => setFormData({ ...formData, buddyNames: e.target.value.split(',').map(s => s.trim()) })}
         />
         <input 
           type="text"
           placeholder="Dive Center / Boat"
           className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/20"
           value={formData.diveCenter}
           onChange={(e) => setFormData({ ...formData, diveCenter: e.target.value })}
         />
      </div>

      <div className="space-y-4">
         <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes</label>
         <textarea 
          placeholder="Memorable moments, equipment issues, or training progress..."
          className="w-full p-5 bg-slate-50 border-none rounded-2xl min-h-[120px] focus:ring-2 focus:ring-maldives-lagoon/20"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
         />
      </div>
    </div>
  );
}

interface Step5Props {
  formData: Partial<DiveLog>;
  uploadingProgress: Record<string, number>;
  triggerFileInput: (type: 'image' | 'video') => void;
  removeMedia: (id: string) => void;
}

export function Step5({ formData, uploadingProgress, triggerFileInput, removeMedia }: Step5Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dive Media</h2>
        <p className="text-slate-500 mb-6 font-medium">Add photos and videos from your dive</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => triggerFileInput('image')}
          className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-3 hover:bg-slate-100 transition-colors"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Camera className="w-6 h-6 text-maldives-lagoon" />
          </div>
          <span className="text-sm font-bold text-slate-600">Add Photo</span>
        </button>
        <button 
          onClick={() => triggerFileInput('video')}
          className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-3 hover:bg-slate-100 transition-colors"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Film className="w-6 h-6 text-maldives-lagoon" />
          </div>
          <span className="text-sm font-bold text-slate-600">Add Video</span>
        </button>
      </div>

      {formData.media && formData.media.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {formData.media.map(item => {
            const progress = uploadingProgress[item.id] || 0;
            const isUploading = progress < 100;

            return (
              <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg">
                {item.type === 'image' ? (
                  <img src={item.url} alt="Dive" className={cn("w-full h-full object-cover transition-all", isUploading && "blur-sm opacity-50")} referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white opacity-80" />
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                     <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-maldives-turquoise transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                     </div>
                     <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-widest">{Math.round(progress)}%</span>
                  </div>
                )}

                <button 
                  onClick={() => removeMedia(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-widest">
                  {item.type}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

