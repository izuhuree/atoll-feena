import { addDoc, collection } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { stripUndefinedDeep } from '../lib/firestoreData';
import { DiveSite, DiveSiteEditSuggestion } from '../types';

export function useDiveSiteSuggestions() {
  const submitSuggestion = async (
    site: Partial<DiveSite>,
    existingSiteId?: string
  ) => {
    if (!db || !auth?.currentUser) return;

    const submittedAt = new Date().toISOString();
    const payload: Omit<DiveSiteEditSuggestion, 'id'> = {
      siteId: existingSiteId,
      siteName: site.name || 'Unnamed dive site',
      atoll: site.atoll!,
      proposedDescription: site.description,
      proposedSite: site,
      status: 'pending',
      submittedBy: auth.currentUser.uid,
      submittedAt,
      generatedByAI: Boolean(site.descriptionGeneratedAt),
      editedByContributor: true,
      sourcesUsed: site.descriptionSourceRefs || [],
      generatedAt: site.descriptionGeneratedAt,
      reviewStatus: 'suggested',
    };

    try {
      await addDoc(collection(db, 'diveSiteEditSuggestions'), stripUndefinedDeep(payload));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'diveSiteEditSuggestions');
    }
  };

  return { submitSuggestion };
}
