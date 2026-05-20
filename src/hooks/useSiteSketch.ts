import { useCallback, useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage, isAdmin, auth } from '../lib/firebase';
import { DiveSite } from '../types';
import { buildSketchPrompt } from '../lib/sketchPrompt';

type Status = 'idle' | 'loading-existing' | 'generating' | 'ready' | 'error';

const SKETCH_MODEL = 'imagen-3.0-generate-002';

/**
 * Hybrid procedural-SVG + AI-image hook for dive-site sketches.
 *
 *   1. On mount, look up `diveSites/{id}.aiSketchUrl` in Firestore. If present,
 *      surface it immediately — every visitor sees the cached image.
 *   2. If absent **and** the current user is an admin, expose `generate()` so
 *      they can request a fresh sketch from Gemini Imagen. The image bytes are
 *      returned as base64, uploaded to Firebase Storage at
 *      `divesite-sketches/{id}.png`, then the public URL is persisted back to
 *      Firestore so subsequent users skip the regeneration cost.
 *   3. Non-admins fall back to the procedural SVG (rendered by SiteSketchSvg).
 *
 * We never call Gemini twice for the same site — caching is the whole point.
 */
export function useSiteSketch(site: DiveSite) {
  const [status, setStatus] = useState<Status>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canGenerate = isAdmin();

  // Initial fetch of any previously-cached URL.
  useEffect(() => {
    let active = true;
    if (!db) return;

    (async () => {
      try {
        setStatus('loading-existing');
        const snap = await getDoc(doc(db!, 'diveSites', site.id));
        if (!active) return;
        const cached = snap.exists() ? (snap.data() as { aiSketchUrl?: string }).aiSketchUrl : null;
        setImageUrl(cached ?? null);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        console.error('useSiteSketch.load', err);
        setStatus('ready'); // non-fatal — we still show the SVG fallback
      }
    })();

    return () => {
      active = false;
    };
  }, [site.id]);

  const generate = useCallback(async () => {
    if (!canGenerate) {
      setError('Only admins can generate AI sketches.');
      return;
    }
    if (!db || !storage) {
      setError('Firebase is not configured.');
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      setError('Missing GEMINI_API_KEY — set it in your .env file.');
      return;
    }

    setStatus('generating');
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildSketchPrompt(site);

      // Imagen 3 returns base64-encoded PNG bytes (no data URL prefix).
      const result = await ai.models.generateImages({
        model: SKETCH_MODEL,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      });

      const bytes = result.generatedImages?.[0]?.image?.imageBytes;
      if (!bytes) throw new Error('Gemini returned no image bytes.');

      // Upload base64 → Firebase Storage. Path matches storage.rules.
      const dataUrl = `data:image/png;base64,${bytes}`;
      const storageRef = ref(storage, `divesite-sketches/${site.id}.png`);
      await uploadString(storageRef, dataUrl, 'data_url', {
        contentType: 'image/png',
        customMetadata: {
          generatedBy: auth?.currentUser?.uid ?? 'unknown',
          model: SKETCH_MODEL,
          generatedAt: new Date().toISOString(),
        },
      });

      const publicUrl = await getDownloadURL(storageRef);

      // Persist the URL back on the dive-site doc so non-admins see it too.
      await setDoc(
        doc(db, 'diveSites', site.id),
        { aiSketchUrl: publicUrl, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      setImageUrl(publicUrl);
      setStatus('ready');
    } catch (err) {
      console.error('useSiteSketch.generate', err);
      setError(err instanceof Error ? err.message : 'Failed to generate sketch.');
      setStatus('error');
    }
  }, [canGenerate, site]);

  return {
    status,
    imageUrl,
    error,
    canGenerate,
    generate,
    isGenerating: status === 'generating',
  };
}
