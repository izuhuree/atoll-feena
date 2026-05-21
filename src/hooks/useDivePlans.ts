import { User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DivePlan, ProSubscription } from '../types';

export function useDivePlans(user: User | null, subscription: ProSubscription | null) {
  const [plans, setPlans] = useState<DivePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db || subscription?.status !== 'active') {
      setPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const constraints =
      subscription.tier === 'dive-centre-pro' && subscription.diveCentreId
        ? [where('diveCentreId', '==', subscription.diveCentreId)]
        : [where('ownerId', '==', user.uid)];

    return onSnapshot(
      query(collection(db, 'divePlans'), ...constraints),
      (snapshot) => {
        const rows = snapshot.docs.map((planDoc) => ({ id: planDoc.id, ...planDoc.data() } as DivePlan));
        rows.sort((a, b) => `${b.plannedDate} ${b.plannedTime}`.localeCompare(`${a.plannedDate} ${a.plannedTime}`));
        setPlans(rows);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        try {
          handleFirestoreError(snapshotError, OperationType.LIST, 'divePlans');
        } catch (wrappedError) {
          setError(wrappedError instanceof Error ? wrappedError.message : 'Unable to load dive plans.');
        }
        setLoading(false);
      }
    );
  }, [subscription, user]);

  const savePlan = async (plan: DivePlan) => {
    if (!db) throw new Error('Firebase is not configured.');
    setIsSaving(true);
    setError(null);
    try {
      await setDoc(doc(db, 'divePlans', plan.id), plan, { merge: true });
    } catch (saveError) {
      try {
        handleFirestoreError(saveError, OperationType.WRITE, `divePlans/${plan.id}`);
      } catch (wrappedError) {
        setError(wrappedError instanceof Error ? wrappedError.message : 'Unable to save dive plan.');
      }
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  };

  return { plans, loading, isSaving, error, savePlan };
}
