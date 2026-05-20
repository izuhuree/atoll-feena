import { useState, useEffect } from 'react';
import { DiveSite } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export function useDiveSites() {
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'diveSites'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbDocs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DiveSite));
      setSites(dbDocs);
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
