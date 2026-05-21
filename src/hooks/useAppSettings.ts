import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../lib/firebase';
import { AppSettings } from '../types';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: 'AtollFeeNa',
  contributionReviewRequired: true,
  sketchGenerationEnabled: true,
  defaultSketchInstructionsFromDescription: true,
  speciesObservationReviewRequired: true,
  publicDiveDataDefault: 'private',
  dataExportEnabled: false,
};

export function useAppSettings(enabled: boolean, user: User | null) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !db) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return onSnapshot(
      doc(db, 'appSettings', 'main'),
      (snapshot) => {
        setSettings(snapshot.exists() ? snapshot.data() as AppSettings : null);
        setError(null);
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error(snapshotError);
        setError('Unable to load app settings.');
        setIsLoading(false);
      }
    );
  }, [enabled]);

  const saveSettings = useCallback(
    async (updates: AppSettings) => {
      if (!db) throw new Error('Database is not configured.');
      setIsSaving(true);
      setError(null);
      try {
        await setDoc(
          doc(db, 'appSettings', 'main'),
          {
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.uid || 'unknown',
          },
          { merge: true }
        );
      } catch (saveError) {
        console.error(saveError);
        setError('Unable to save app settings.');
        throw saveError;
      } finally {
        setIsSaving(false);
      }
    },
    [user?.uid]
  );

  return useMemo(
    () => ({
      settings,
      effectiveSettings: { ...DEFAULT_APP_SETTINGS, ...settings },
      isLoading,
      isSaving,
      error,
      saveSettings,
    }),
    [error, isLoading, isSaving, saveSettings, settings]
  );
}
