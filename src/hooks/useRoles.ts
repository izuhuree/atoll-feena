import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Role } from '../types';

export function useRoles(uid?: string) {
  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => {
    if (!db || !uid) return;
    return onSnapshot(doc(db, 'admins', uid), (snap) => {
      const value = snap.data()?.roles;
      setRoles(Array.isArray(value) ? value : []);
    });
  }, [uid]);
  return {
    roles,
    isAdmin: roles.includes('admin'),
    canUseKb: roles.some((r) => ['admin', 'kb_uploader', 'kb_reviewer'].includes(r))
  };
}
