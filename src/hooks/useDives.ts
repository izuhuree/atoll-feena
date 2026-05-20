import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DiveLog } from '../types';

export function useDives() {
  const [dives, setDives] = useState<DiveLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !auth.currentUser || !db) {
      setDives([]);
      setLoading(false);
      return;
    }

    const path = 'diveLogs';
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const diveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiveLog[];
      // Sort client-side to avoid needing a composite index
      diveData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setDives(diveData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [auth?.currentUser?.uid]);

  const addDive = async (dive: Omit<DiveLog, 'userId' | 'syncStatus'>) => {
    if (!auth || !auth.currentUser || !db) throw new Error('Not authenticated or Firebase not configured');
    
    const path = 'diveLogs';
    const diveId = dive.id || `log-${Date.now()}`;
    try {
      await setDoc(doc(db, path, diveId), {
        ...dive,
        id: diveId,
        userId: auth.currentUser.uid,
        syncStatus: 'synced',
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${diveId}`);
    }
  };

  return { dives, loading, addDive };
}
