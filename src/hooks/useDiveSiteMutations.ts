import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { stripUndefinedDeep } from '../lib/firestoreData';
import { DiveSite } from '../types';

export function useDiveSiteMutations() {
  const saveSite = async (site: DiveSite) => {
    if (!db) return;
    const siteId = site.id || `site-${Date.now()}`;
    try {
      await setDoc(doc(db, 'diveSites', siteId), stripUndefinedDeep({
        ...site,
        id: siteId,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `diveSites/${siteId}`);
    }
  };

  const saveSiteDescription = async (site: DiveSite) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'diveSites', site.id), stripUndefinedDeep({
        description: site.description || '',
        descriptionSourceRefs: site.descriptionSourceRefs || [],
        descriptionGeneratedAt: site.descriptionGeneratedAt,
        descriptionGeneratedBy: site.descriptionGeneratedBy,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `diveSites/${site.id}`);
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

  return { saveSite, saveSiteDescription, deleteSite };
}
