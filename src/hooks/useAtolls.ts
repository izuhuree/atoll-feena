import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Atoll } from '../types';

interface AtollRecord {
  id: string;
  name: Atoll;
  sortOrder?: number;
}

export function useAtolls() {
  const [atolls, setAtolls] = useState<AtollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setAtolls([]);
      setLoading(false);
      return;
    }

    const path = 'atolls';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const records = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as AtollRecord))
        .filter((record) => typeof record.name === 'string')
        .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

      setAtolls(records);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, []);

  return { atolls, loading };
}
