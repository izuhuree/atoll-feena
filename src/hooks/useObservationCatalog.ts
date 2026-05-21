import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CurrentStrength,
  CurrentDirection,
  DebrisType,
  EntryExitDifficulty,
  ReefHealthIndicator,
  SurgeStrength,
} from '../types';

export interface ObservationCatalog {
  currentStrength: CurrentStrength[];
  currentDirection: CurrentDirection[];
  surge: SurgeStrength[];
  surfaceConditions: Array<'calm' | 'choppy' | 'rough' | 'unknown'>;
  entryExitDifficulty: EntryExitDifficulty[];
  hazards: string[];
  reefHealth: ReefHealthIndicator[];
  debris: DebrisType[];
}

type CatalogKey = keyof ObservationCatalog;

const EMPTY_CATALOG: ObservationCatalog = {
  currentStrength: [],
  currentDirection: [],
  surge: [],
  surfaceConditions: [],
  entryExitDifficulty: [],
  hazards: [],
  reefHealth: [],
  debris: [],
};

const CATALOG_KEYS = new Set<CatalogKey>([
  'currentStrength',
  'currentDirection',
  'surge',
  'surfaceConditions',
  'entryExitDifficulty',
  'hazards',
  'reefHealth',
  'debris',
]);

export function useObservationCatalog() {
  const [catalog, setCatalog] = useState<ObservationCatalog>(EMPTY_CATALOG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setCatalog(EMPTY_CATALOG);
      setLoading(false);
      return;
    }

    const path = 'observationCatalog';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const next: ObservationCatalog = { ...EMPTY_CATALOG };

      snapshot.docs.forEach((doc) => {
        const key = doc.id as CatalogKey;
        const data = doc.data();
        if (CATALOG_KEYS.has(key) && Array.isArray(data.options)) {
          next[key] = data.options.filter((option) => typeof option === 'string') as never;
        }
      });

      setCatalog(next);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, []);

  return { catalog, loading };
}
