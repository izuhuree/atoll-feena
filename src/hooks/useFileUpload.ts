import { useState, useRef, ChangeEvent } from 'react';

export function useFileUpload(onUploadComplete: (file: File, id: string, type: 'image' | 'video', url: string) => void) {
  const [uploadingProgress, setUploadingProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const id = Math.random().toString(36).substr(2, 9);
    const type = file.type.startsWith('video') ? 'video' : 'image';
    
    const url = URL.createObjectURL(file);

    setUploadingProgress(prev => ({ ...prev, [id]: 10 }));
    
    const interval = setInterval(() => {
      setUploadingProgress(prev => {
        const current = prev[id] || 10;
        const next = current + Math.random() * 20;
        
        if (next >= 100) {
          clearInterval(interval);
          return { ...prev, [id]: 100 };
        }
        return { ...prev, [id]: next };
      });
    }, 400);

    onUploadComplete(file, id, type, url);
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
