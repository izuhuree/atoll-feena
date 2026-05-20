import { useState, useEffect } from 'react';
import type { MarineLife } from '../data/marineLife';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export function useMarineLife() {
  const [lifeRecords, setLifeRecords] = useState<MarineLife[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'marineLife'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbDocs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MarineLife));
      setLifeRecords(dbDocs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marineLife');
    });

    return unsubscribe;
  }, []);

  const saveLife = async (life: MarineLife) => {
    if (!db) return;
    const lifeId = life.id || `life-${Date.now()}`;
    try {
      await setDoc(doc(db, 'marineLife', lifeId), {
        ...life,
        id: lifeId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `marineLife/${lifeId}`);
    }
  };

  const deleteLife = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'marineLife', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `marineLife/${id}`);
    }
  };

  return { allLife: lifeRecords, loading, saveLife, deleteLife };
}
