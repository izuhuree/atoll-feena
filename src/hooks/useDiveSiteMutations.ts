import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DiveSite } from '../types';

export function useDiveSiteMutations() {
  const saveSite = async (site: DiveSite) => {
    if (!db) return;
    const siteId = site.id || `site-${Date.now()}`;
    try {
      await setDoc(doc(db, 'diveSites', siteId), {
        ...site,
        id: siteId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `diveSites/${siteId}`);
    }
  };

  const deleteSite = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'diveSites', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `diveSites/${id}`);
    }
  };

  return { saveSite, deleteSite };
}
