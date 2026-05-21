import { useCallback, useEffect, useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, handleFirestoreError, OperationType, storage } from '../lib/firebase';
import { CertificationProfile, UserProfile } from '../types';

export interface EditableUserProfile extends UserProfile {
  photoURL?: string;
}

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export function useUserProfile(user: User | null) {
  const [profile, setProfile] = useState<EditableUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        const raw = (snap.data() || {}) as Partial<EditableUserProfile>;
        setProfile({
          uid: user.uid,
          name: raw.name || user.displayName || 'Diver',
          email: raw.email || user.email || '',
          photoURL: raw.photoURL || user.photoURL || undefined,
          role: raw.role,
          accessStatus: raw.accessStatus || 'active',
          homeCountry: raw.homeCountry || '',
          certificationProfile: raw.certificationProfile,
          units: raw.units || 'metric',
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
        });
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error(snapshotError);
        setError('Failed to load profile.');
        setIsLoading(false);
      }
    );

    return unsub;
  }, [user]);

  const saveProfile = useCallback(
    async (updates: Partial<EditableUserProfile>) => {
      if (!user || !db) throw new Error('User not signed in.');
      setIsSaving(true);
      setError(null);

      const payload: Partial<EditableUserProfile> = {
        uid: user.uid,
        name: updates.name ?? profile?.name ?? user.displayName ?? 'Diver',
        email: user.email || profile?.email || '',
        homeCountry: updates.homeCountry ?? profile?.homeCountry ?? '',
        units: updates.units ?? profile?.units ?? 'metric',
        certificationProfile: updates.certificationProfile ?? profile?.certificationProfile,
        photoURL: updates.photoURL ?? profile?.photoURL ?? user.photoURL ?? undefined,
      };

      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            ...payload,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        if (auth?.currentUser) {
          const authUpdates: { displayName?: string; photoURL?: string } = {};
          if (payload.name && payload.name !== auth.currentUser.displayName) {
            authUpdates.displayName = payload.name;
          }
          if (payload.photoURL && payload.photoURL !== auth.currentUser.photoURL) {
            authUpdates.photoURL = payload.photoURL;
          }
          if (Object.keys(authUpdates).length > 0) {
            await updateProfile(auth.currentUser, authUpdates);
          }
        }
      } catch (saveError) {
        let message = 'Failed to save profile.';
        try {
          handleFirestoreError(saveError, OperationType.UPDATE, `users/${user.uid}`);
        } catch (wrappedError) {
          message = wrappedError instanceof Error ? wrappedError.message : message;
        }
        setError(message);
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [profile, user]
  );

  const uploadProfilePhoto = useCallback(
    async (file: File) => {
      if (!user || !storage) throw new Error('Storage not configured.');
      if (!file.type.startsWith('image/')) throw new Error('Please upload an image file.');
      if (file.size > MAX_PROFILE_IMAGE_SIZE) throw new Error('Image must be 5MB or smaller.');

      setIsSaving(true);
      setError(null);
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileRef = ref(storage, `users/${user.uid}/profile/${Date.now()}-${safeName}`);
        await uploadBytes(fileRef, file, { contentType: file.type });
        const downloadURL = await getDownloadURL(fileRef);
        await saveProfile({ photoURL: downloadURL });
        return downloadURL;
      } catch (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload profile image.';
        setError(message);
        throw uploadError;
      } finally {
        setIsSaving(false);
      }
    },
    [saveProfile, user]
  );

  const saveCertificationProfile = useCallback(
    async (certificationProfile: CertificationProfile) => {
      await saveProfile({ certificationProfile });
    },
    [saveProfile]
  );

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveProfile,
    saveCertificationProfile,
    uploadProfilePhoto,
  };
}
