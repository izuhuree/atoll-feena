import { useState } from 'react';
import { ChevronLeft, Waves } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDives } from '../../hooks/useDives';
import { MARINE_LIFE_DATABASE } from '../../data/marineLife';
import { useQuickLogForm } from '../../hooks/useQuickLogForm';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Step1 } from '../quick-log/Step1';
import { Step2, Step3 } from '../quick-log/Step23';
import { Step4, Step5 } from '../quick-log/Step45';
import { Step6 } from '../quick-log/Step6';

interface QuickLogProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function QuickLog({ onComplete, onCancel }: QuickLogProps) {
  const { dives, addDive } = useDives();
  const [step, setStep] = useState(1);
  const { formData, setFormData, calculateSAC } = useQuickLogForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    uploadingProgress,
    fileInputRef,
    handleFileSelect,
    triggerFileInput
  } = useFileUpload((file, id, type, url) => {
    const species = (fileInputRef.current as any).speciesTag;
    setFormData(prev => ({
      ...prev,
      media: [...(prev.media || []), { id, type, url, description: species ? `Photo of ${species}` : undefined } as any]
    }));
    (fileInputRef.current as any).speciesTag = null;
  });

  const addSighting = (species: string) => {
    if (!formData.marineLife?.includes(species)) {
      setFormData({
        ...formData,
        marineLife: [...(formData.marineLife || []), species]
      });
    }
  };

  const removeSighting = (species: string) => {
    setFormData({
      ...formData,
      marineLife: formData.marineLife?.filter(l => l !== species)
    });
  };

  const triggerSightingPhoto = (species: string) => {
    (fileInputRef.current as any).speciesTag = species;
    triggerFileInput('image');
  };

  const removeMedia = (id: string) => {
    setFormData({
      ...formData,
      media: formData.media?.filter(m => m.id !== id)
    });
  };

  const handleNext = () => {
    if (step === 1 && !formData.customSiteName) return;
    setStep(s => s + 1);
  };

  const handleBack = () => step > 1 ? setStep(s => s - 1) : onCancel();

  const isStepValid = () => {
    if (step === 1) return !!formData.customSiteName;
    return true;
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const sac = calculateSAC();
      const nextDiveNumber = (dives.length > 0 ? Math.max(...dives.map(d => d.diveNumber || 0)) : 0) + 1;
      
      await addDive({
        ...formData,
        sac,
        diveNumber: nextDiveNumber,
        siteId: formData.siteId || 'custom',
        customSiteName: formData.customSiteName || 'Leisure Dive',
        syncStatus: 'synced',
        media: formData.media || []
      } as any);
      onComplete();
    } catch (error) {
      console.error('Failed to log dive:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <img 
              src="/logo.png" 
              alt="" 
              className="w-4 h-4 rounded-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <h1 className="font-display font-bold text-lg text-maldives-deep leading-none">AtollFeeNa</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-medium text-slate-400 mt-0.5">{step}/6</p>
        </div>
        <div className="w-10" />
      </header>

      <div className="px-6 py-6 pb-40">
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />

        {step === 1 && <Step1 formData={formData} setFormData={setFormData} onNext={handleNext} />}
        {step === 2 && <Step2 formData={formData} setFormData={setFormData} />}
        {step === 3 && <Step3 formData={formData} setFormData={setFormData} calculateSAC={calculateSAC} />}
        {step === 4 && (
          <Step4 
            formData={formData} 
            setFormData={setFormData}
            addSighting={addSighting}
            removeSighting={removeSighting}
            triggerSightingPhoto={triggerSightingPhoto}
            removeMedia={removeMedia}
          />
        )}
        {step === 5 && (
          <Step5 
            formData={formData} 
            uploadingProgress={uploadingProgress}
            triggerFileInput={triggerFileInput}
            removeMedia={removeMedia}
          />
        )}
        {step === 6 && <Step6 formData={formData} setFormData={setFormData} calculateSAC={calculateSAC} />}

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md z-20">
          <div className="max-w-md mx-auto">
            {step < 6 ? (
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={cn(
                  "w-full py-5 text-white rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all",
                  isStepValid() ? "bg-slate-900 shadow-slate-100" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className={cn(
                  "w-full py-5 text-white rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                  isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-maldives-lagoon shadow-maldives-shallow/50"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Waves className="w-5 h-5 animate-pulse" />
                    <span>Logging Dive...</span>
                  </>
                ) : (
                  'Complete Dive Log'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

