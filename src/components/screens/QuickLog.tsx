import { useState } from 'react';
import { ChevronLeft, Waves } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDives } from '../../hooks/useDives';
import { useQuickLogForm } from '../../hooks/useQuickLogForm';
import { useFileUpload } from '../../hooks/useFileUpload';
import { SiteSelectionPanel } from '../quick-log/SiteSelectionPanel';
import { DiveProfilePanel, GasPressurePanel } from '../quick-log/DiveProfileAndGasPanels';
import { ObservationsPanel, DiveMediaPanel } from '../quick-log/ObservationsAndMediaPanels';
import { DiveReviewPanel } from '../quick-log/DiveReviewPanel';
import { validateDiveLogDraft } from '../../lib/diveLogValidation';

interface QuickLogProps {
  onComplete: () => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 6;
const STEP_LABELS: Record<number, string> = {
  1: 'Site',
  2: 'Depth & Time',
  3: 'Gas & Conditions',
  4: 'Marine Life',
  5: 'Photos',
  6: 'Review',
};

export function QuickLog({ onComplete, onCancel }: QuickLogProps) {
  const { dives, addDive } = useDives();
  const [step, setStep] = useState(1);
  const { formData, setFormData, calculateSAC } = useQuickLogForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showStepError, setShowStepError] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    uploadingProgress,
    fileInputRef,
    handleFileSelect,
    triggerFileInput,
  } = useFileUpload((file, media) => {
    const species = (fileInputRef.current as any).speciesTag;
    setFormData((prev) => ({
      ...prev,
      media: [
        ...(prev.media || []),
        {
          ...media,
          description: species ? `Photo of ${species}` : undefined,
          observationRef: species ? `species:${species}` : undefined,
        },
      ],
      speciesObservations: species
        ? (prev.speciesObservations || []).map((item) =>
            item.speciesName === species ? { ...item, hasMediaEvidence: true } : item
          )
        : prev.speciesObservations,
    }));
    (fileInputRef.current as any).speciesTag = null;
  });

  const addSighting = (species: string) => {
    if (!formData.marineLife?.includes(species)) {
      setFormData({
        ...formData,
        marineLife: [...(formData.marineLife || []), species],
        speciesObservations: [
          ...(formData.speciesObservations || []),
          {
            id: `species-${Date.now()}`,
            speciesName: species,
            count: 1,
            confidence: 'medium',
            hasMediaEvidence: false,
            sensitiveLocation: false,
          },
        ],
      });
    }
  };

  const removeSighting = (species: string) => {
    setFormData({
      ...formData,
      marineLife: formData.marineLife?.filter((l) => l !== species),
      speciesObservations: formData.speciesObservations?.filter(
        (item) => item.speciesName !== species
      ),
    });
  };

  const triggerSightingPhoto = (species: string) => {
    (fileInputRef.current as any).speciesTag = species;
    triggerFileInput('image');
  };

  const removeMedia = (id: string) => {
    setFormData({
      ...formData,
      media: formData.media?.filter((m) => m.id !== id),
    });
  };

  const isStepValid = () => {
    if (step === 1) {
      // Need a site name (either picked from list or entered manually).
      return !!formData.customSiteName?.trim();
    }
    return true;
  };

  const stepErrorMessage = () => {
    if (step === 1) return 'Pick a site or enter a name to continue.';
    return '';
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setShowStepError(true);
      return;
    }
    setShowStepError(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const hasUserInput = () =>
    !!(
      formData.customSiteName ||
      formData.siteId ||
      (formData.marineLife && formData.marineLife.length > 0) ||
      (formData.notes && formData.notes.length > 0) ||
      (formData.media && formData.media.length > 0)
    );

  const handleBack = () => {
    setShowStepError(false);
    if (step > 1) {
      setStep((s) => s - 1);
      return;
    }
    // On step 1, going back exits the flow — guard against accidental data loss.
    if (hasUserInput()) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleComplete = async () => {
    const validationErrors = validateDiveLogDraft(formData);
    if (validationErrors.length > 0) {
      setStatusMessage(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const sac = calculateSAC();
      const nextDiveNumber =
        (dives.length > 0 ? Math.max(...dives.map((d) => d.diveNumber || 0)) : 0) + 1;

      await addDive({
        ...formData,
        sac,
        diveNumber: nextDiveNumber,
        siteId: formData.siteId || 'custom',
        customSiteName: formData.customSiteName || 'Leisure Dive',
        syncStatus: 'synced',
        media: formData.media || [],
        siteConditions: {
          ...formData.siteConditions,
          current: formData.current || 'unknown',
          visibilityMeters: formData.visibility,
          waterTempC: formData.waterTemp,
          reportTime: new Date().toISOString(),
        },
        observationMetadata: formData.observationMetadata || {
          source: 'diver',
          verificationStatus: 'unverified',
          privacy: 'public aggregate',
        },
      } as any);
      setSuccessMessage(buildContributionMessage(formData));
      window.setTimeout(onComplete, 1400);
    } catch (error) {
      console.error('Failed to log dive:', error);
      setStatusMessage('Failed to save this dive. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPct = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 pt-12 pb-3 sticky top-0 bg-white z-10 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            aria-label={step > 1 ? 'Previous step' : 'Cancel logging'}
            className="w-11 h-11 flex items-center justify-center bg-slate-50 rounded-full active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-display font-bold text-base text-maldives-deep leading-none">
              {STEP_LABELS[step]}
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-medium text-slate-400 mt-1">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>
          <div className="w-11" />
        </div>
        <div
          className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label="Dive log progress"
        >
          <div
            className="h-full bg-maldives-lagoon transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="px-6 py-6 pb-[calc(220px+env(safe-area-inset-bottom))]">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />

        {step === 1 && <SiteSelectionPanel formData={formData} setFormData={setFormData} onNext={handleNext} />}
        {step === 2 && <DiveProfilePanel formData={formData} setFormData={setFormData} />}
        {step === 3 && (
          <GasPressurePanel formData={formData} setFormData={setFormData} calculateSAC={calculateSAC} />
        )}
        {step === 4 && (
          <ObservationsPanel
            formData={formData}
            setFormData={setFormData}
            addSighting={addSighting}
            removeSighting={removeSighting}
            triggerSightingPhoto={triggerSightingPhoto}
            removeMedia={removeMedia}
          />
        )}
        {step === 5 && (
          <DiveMediaPanel
            formData={formData}
            uploadingProgress={uploadingProgress}
            triggerFileInput={triggerFileInput}
            removeMedia={removeMedia}
          />
        )}
        {step === 6 && (
          <DiveReviewPanel formData={formData} setFormData={setFormData} calculateSAC={calculateSAC} />
        )}

        <div className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-white/90 backdrop-blur-md z-40 border-t border-slate-100">
          <div className="max-w-md mx-auto space-y-2">
            {showStepError && !isStepValid() && (
              <p className="text-xs text-rose-500 font-medium text-center" role="alert">
                {stepErrorMessage()}
              </p>
            )}
            {statusMessage && (
              <p className="text-xs text-rose-500 font-medium text-center" role="alert">
                {statusMessage}
              </p>
            )}
            {successMessage && (
              <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-700" role="status">
                {successMessage}
              </p>
            )}
            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                aria-disabled={!isStepValid()}
                className={cn(
                  'w-full min-h-[56px] py-4 text-white rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all',
                  isStepValid()
                    ? 'bg-slate-900 shadow-slate-100'
                    : 'bg-slate-300 text-white/90 cursor-not-allowed'
                )}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className={cn(
                  'w-full min-h-[56px] py-4 text-white rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2',
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-maldives-lagoon shadow-maldives-shallow/50'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Waves className="w-5 h-5 animate-pulse" />
                    <span>Logging dive…</span>
                  </>
                ) : (
                  'Complete Dive Log'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-6"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h2 id="cancel-title" className="text-lg font-display font-bold text-maldives-deep mb-2">
              Discard this log?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Your entries on this dive log will be lost. This can't be undone.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onCancel}
                className="w-full min-h-[48px] py-3 bg-rose-500 text-white rounded-2xl font-semibold active:scale-[0.98] transition-transform"
              >
                Discard
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full min-h-[48px] py-3 bg-slate-50 text-slate-700 rounded-2xl font-semibold active:scale-[0.98] transition-transform"
              >
                Keep editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildContributionMessage(formData: ReturnType<typeof useQuickLogForm>['formData']) {
  const updates = [
    formData.siteConditions ? 'site conditions' : '',
    (formData.speciesObservations?.length || 0) > 0 ? 'species sightings' : '',
    (formData.reefHealthObservations?.length || 0) > 0 ? 'reef health' : '',
    (formData.debrisObservations?.length || 0) > 0 ? 'debris records' : '',
  ].filter(Boolean);

  return updates.length > 0
    ? `Dive saved. Your log updated ${updates.join(', ')} for this site.`
    : 'Dive saved. Your log strengthens the shared reef and safety record.';
}
