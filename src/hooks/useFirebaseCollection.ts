import { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, where, type DocumentData } from 'firebase/firestore';
import { db, stripUndefined } from '../lib/firebase';

export function useCollection<T extends { id: string }>(path: string, fallback: T[] = [], userField?: string, uid?: string) {
  const [items, setItems] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(Boolean(db));
  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const base = collection(db, path);
    const q = userField && uid ? query(base, where(userField, '==', uid)) : query(base);
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
      setLoading(false);
    }, () => setLoading(false));
  }, [path, uid, userField]);
  return { items, loading };
}

export async function saveDoc<T extends Record<string, unknown>>(path: string, id: string | undefined, data: T) {
  if (!db) throw new Error('Firebase is not configured');
  const payload = stripUndefined({ ...data, updatedAt: serverTimestamp() });
  if (id) {
    await setDoc(doc(db, path, id), payload, { merge: true });
    return id;
  }
  const ref = await addDoc(collection(db, path), { ...payload, createdAt: serverTimestamp() } as DocumentData);
  await setDoc(ref, { id: ref.id }, { merge: true });
  return ref.id;
}

export function newestFirst<T extends { date?: string; createdAt?: unknown }>(items: T[]) {
  return [...items].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}
