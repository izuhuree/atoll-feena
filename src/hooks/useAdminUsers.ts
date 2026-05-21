import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserAccessStatus, UserProfile, UserRole } from '../types';

export interface ManagedUser extends UserProfile {
  uid: string;
}

export function useAdminUsers(enabled: boolean) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!enabled || !db) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const usersQuery = query(collection(db, 'users'), orderBy('name'));
    return onSnapshot(
      usersQuery,
      (snapshot) => {
        const nextUsers = snapshot.docs.map((userDoc) => {
          const data = userDoc.data() as Partial<UserProfile>;
          return {
            uid: data.uid || userDoc.id,
            name: data.name || 'Unnamed diver',
            email: data.email || '',
            photoURL: data.photoURL,
            role: data.role || 'recreational-diver',
            accessStatus: data.accessStatus || 'active',
            homeCountry: data.homeCountry,
            certificationProfile: data.certificationProfile,
            units: data.units || 'metric',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setUsers(nextUsers);
        setError(null);
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error(snapshotError);
        setError('Unable to load users. Check administrator permissions.');
        setIsLoading(false);
      }
    );
  }, [enabled]);

  const updateUserRole = useCallback(async (uid: string, role: UserRole) => {
    if (!db) throw new Error('Database is not configured.');
    setIsSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'users', uid), {
        role,
        updatedAt: new Date().toISOString(),
      });
    } catch (updateError) {
      console.error(updateError);
      setError('Unable to update user role.');
      throw updateError;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (uid: string, accessStatus: UserAccessStatus) => {
    if (!db) throw new Error('Database is not configured.');
    setIsSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'users', uid), {
        accessStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (updateError) {
      console.error(updateError);
      setError('Unable to update user access status.');
      throw updateError;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return useMemo(
    () => ({
      users,
      isLoading,
      isSaving,
      error,
      updateUserRole,
      updateUserStatus,
    }),
    [error, isLoading, isSaving, updateUserRole, updateUserStatus, users]
  );
}
