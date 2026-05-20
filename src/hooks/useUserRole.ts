import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';

const trustedRoles: UserRole[] = [
  'dive-professional',
  'dive-centre-manager',
  'marine-science-reviewer',
  'platform-admin',
];

export function isTrustedSiteRole(role: UserRole, admin: boolean) {
  return admin || trustedRoles.includes(role);
}

export function useUserRole(user: User | null) {
  const [role, setRole] = useState<UserRole>('recreational-diver');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setRole('recreational-diver');
      setIsAdmin(false);
      return;
    }

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const nextRole = snap.data()?.role;
      setRole(typeof nextRole === 'string' ? nextRole as UserRole : 'recreational-diver');
    });

    const checkAdmin = async () => {
      const snap = await getDoc(doc(db, 'admins', user.uid));
      setIsAdmin(snap.exists());
    };
    checkAdmin().catch(() => setIsAdmin(false));

    return unsubscribeProfile;
  }, [user]);

  useEffect(() => {
    if (!auth || !db) return;
    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setIsAdmin(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'admins', nextUser.uid));
        setIsAdmin(snap.exists());
      } catch {
        setIsAdmin(false);
      }
    });
  }, []);

  return {
    role,
    isAdmin,
    canPublishDiveSiteInfo: isTrustedSiteRole(role, isAdmin),
    canEditSketchInstructions: isTrustedSiteRole(role, isAdmin),
  };
}
