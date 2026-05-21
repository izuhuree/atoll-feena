import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  doc, 
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DiveLog, SiteConditionReport, UserProfile } from '../types';

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
    const now = Timestamp.now().toDate().toISOString();
    try {
      await setDoc(doc(db, path, diveId), {
        ...dive,
        id: diveId,
        userId: auth.currentUser.uid,
        syncStatus: 'synced',
        createdAt: now,
        updatedAt: now,
      }, { merge: true });
      try {
        await publishSiteConditionReport(diveId, dive, now);
      } catch (reportError) {
        // The personal dive log save is primary; site-intelligence publishing is best-effort.
        console.error('siteConditionReports publish failed:', reportError);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${diveId}`);
    }
  };

  return { dives, loading, addDive };
}

async function publishSiteConditionReport(
  diveId: string,
  dive: Omit<DiveLog, 'userId' | 'syncStatus'>,
  createdAt: string
) {
  if (!auth?.currentUser || !db || !dive.siteConditions || !dive.siteId || dive.siteId === 'custom') {
    return;
  }

  const privacy = dive.observationMetadata?.privacy || 'public aggregate';
  if (privacy === 'sensitive location') return;

  const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
  const profile = userSnap.exists() ? userSnap.data() as Partial<UserProfile> : {};
  const report: SiteConditionReport = {
    id: diveId,
    siteId: dive.siteId,
    siteName: dive.customSiteName || 'Unknown site',
    atoll: dive.atoll,
    island: dive.island,
    sourceDiveLogId: diveId,
    submittedBy: auth.currentUser.uid,
    contributorRole: profile.role,
    ...dive.siteConditions,
    reportTime: dive.siteConditions.reportTime || createdAt,
    reefHealthSignals: dive.reefHealthObservations?.map((item) => item.indicator) || [],
    debrisSignals: dive.debrisObservations?.map((item) => item.type) || [],
    speciesCount: dive.speciesObservations?.length || 0,
    mediaEvidenceCount: dive.media?.length || 0,
    verificationStatus: dive.observationMetadata?.verificationStatus || 'unverified',
    privacy,
    createdAt,
  };

  await setDoc(doc(db, 'siteConditionReports', diveId), report, { merge: true });
}
