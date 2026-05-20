import { useState, useEffect } from 'react';
import { DiveSite } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { SEED_SITES } from '../constants';

export function useDiveSites() {
  const [sites, setSites] = useState<DiveSite[]>(SEED_SITES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'diveSites'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbDocs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DiveSite));
      
      // Merge: Start with SEED_SITES, then overwrite with DB info if it exists, then add DB entries not in SEED
      const mergedMap = new Map<string, DiveSite>();
      
      // 1. Add seeds
      SEED_SITES.forEach(site => mergedMap.set(site.id, site));
      
      // 2. Add/Overwrite from DB
      dbDocs.forEach(site => mergedMap.set(site.id, site));
      
      const mergedSites = Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      
      setSites(mergedSites);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'diveSites');
    });

    return unsubscribe;
  }, []);

  const saveSite = async (site: DiveSite) => {
    if (!db) return;
    const siteId = site.id || `site-${Date.now()}`;
    try {
      await setDoc(doc(db, 'diveSites', siteId), {
        ...site,
        id: siteId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `diveSites/${siteId}`);
    }
  };

  const removeSite = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'diveSites', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `diveSites/${id}`);
    }
  };

  return { allSites: sites, loading, saveSite, deleteSite: removeSite };
}
