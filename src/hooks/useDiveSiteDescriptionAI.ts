import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { DiveSite, SourceReference } from '../types';
import { getGeminiApiKey } from '../lib/aiSettings';
import { buildDiveSiteDescriptionPrompt } from '../lib/diveSiteDescriptionPrompt';

const DESCRIPTION_MODEL = import.meta.env.VITE_GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

interface DescriptionDraft {
  description: string;
  sources: SourceReference[];
  notes?: string;
}

interface GroundedSource {
  web?: {
    title?: string;
    uri?: string;
    domain?: string;
  };
}

function uniqueSources(sources: SourceReference[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = source.url.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractGroundingSources(response: unknown): SourceReference[] {
  const candidates = (response as { candidates?: { groundingMetadata?: { groundingChunks?: GroundedSource[] } }[] }).candidates || [];
  return uniqueSources(
    candidates.flatMap((candidate) =>
      candidate.groundingMetadata?.groundingChunks
        ?.map((chunk) => chunk.web)
        .filter(Boolean)
        .map((web) => ({
          title: web?.title || web?.domain || 'Source',
          url: web?.uri || '',
          domain: web?.domain,
        })) || []
    )
  );
}

function parseDraft(text: string): DescriptionDraft {
  const trimmed = text.trim();
  const fenced = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const objectStart = fenced.indexOf('{');
  const objectEnd = fenced.lastIndexOf('}');
  const cleaned = objectStart >= 0 && objectEnd > objectStart
    ? fenced.slice(objectStart, objectEnd + 1)
    : fenced;
  const parsed = JSON.parse(cleaned) as DescriptionDraft;
  return {
    description: parsed.description?.trim() || '',
    sources: uniqueSources(parsed.sources || []),
    notes: parsed.notes,
  };
}

export function useDiveSiteDescriptionAI() {
  const [draft, setDraft] = useState<DescriptionDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (site: Partial<DiveSite>) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      setError('Add a Gemini API key in Profile > AI Settings before generating descriptions.');
      return;
    }
    if (!site.name) {
      setError('Add a dive site name before generating a description.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setDraft(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: DESCRIPTION_MODEL,
        contents: buildDiveSiteDescriptionPrompt(site),
        config: {
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        },
      });

      const parsed = parseDraft(response.text || '{}');
      const groundedSources = extractGroundingSources(response);
      const sources = uniqueSources([...parsed.sources, ...groundedSources]).slice(0, 5);

      if (!parsed.description) {
        throw new Error('AI could not generate a reliable description. Add more site details first.');
      }

      setDraft({ ...parsed, sources });
    } catch (err) {
      console.error('useDiveSiteDescriptionAI.generate', err);
      setError(err instanceof Error ? err.message : 'Failed to generate verified description.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearDraft = () => {
    setDraft(null);
    setError(null);
  };

  return { draft, isGenerating, error, generate, clearDraft };
}
