import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

export async function uploadUserFile(uid: string, folder: 'profile' | 'field-guide' | 'dive-media', file: File) {
  if (!storage) throw new Error('Firebase Storage is not configured');
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9. -]/g, '')}`;
  const path = `users/${uid}/${folder}/${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return { url: await getDownloadURL(fileRef), path, name: file.name };
}

export async function removePath(path: string) {
  if (!storage) return;
  await deleteObject(ref(storage, path));
}
