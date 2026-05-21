import { useState, useRef, ChangeEvent } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, storage } from '../lib/firebase';

export interface UploadedDiveMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  storagePath: string;
  contentType: string;
}

export function useFileUpload(onUploadComplete: (file: File, media: UploadedDiveMedia) => void) {
  const [uploadingProgress, setUploadingProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const id = Math.random().toString(36).substr(2, 9);
    const type = file.type.startsWith('video') ? 'video' : 'image';
    const currentUser = auth?.currentUser;

    if (!storage || !currentUser) {
      console.error('Media upload requires Firebase Storage and a signed-in user.');
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `users/${currentUser.uid}/dive-media/${Date.now()}-${id}-${safeName}`;
    const uploadRef = ref(storage, storagePath);
    const task = uploadBytesResumable(uploadRef, file, { contentType: file.type });

    setUploadingProgress((prev) => ({ ...prev, [id]: 1 }));

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          : 0;
        setUploadingProgress((prev) => ({ ...prev, [id]: progress }));
      },
      (uploadError) => {
        console.error('Dive media upload failed:', uploadError);
        setUploadingProgress((prev) => ({ ...prev, [id]: 0 }));
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        onUploadComplete(file, {
          id,
          type,
          url,
          storagePath,
          contentType: file.type,
        });
        setUploadingProgress((prev) => {
          const next = { ...prev };
          next[id] = 100;
          return next;
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    );
  };

  const triggerFileInput = (type: 'image' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  return {
    uploadingProgress,
    setUploadingProgress,
    fileInputRef,
    handleFileSelect,
    triggerFileInput
  };
}
