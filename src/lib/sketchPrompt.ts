import { DiveSite } from '../types';

/**
 * Build a deterministic, dive-accurate prompt for Imagen / Gemini Flash Image
 * given a DiveSite. We deliberately:
 *
 *  - Anchor the visual style to a "hand-drawn dive briefing sketch" so the
 *    model doesn't try to render photographic ocean scenes (those would imply
 *    a level of accuracy we cannot guarantee).
 *  - Include the depth range, current, marine life, and site type so the
 *    image reflects the *data* rather than free-association.
 *  - Add an explicit "do not include text or numbers" guard to keep the
 *    output readable when overlaid with our own depth labels.
 */
export function buildSketchPrompt(site: DiveSite): string {
  const notableFeatures = site.marineLifeHighlights.slice(0, 4).join(', ');

  return [
    `Top-down dive briefing sketch of "${site.name}" in the ${site.atoll} Atoll, Maldives.`,
    `Site type: ${site.type}. Depth range: ${site.depthMin}–${site.depthMax} metres.`,
    `Typical current: ${site.current}. Notable features: ${notableFeatures || 'coral reef structure'}.`,
    `Style: clean watercolor + ink illustration on warm cream paper, soft turquoise and deep teal palette,`,
    `subtle bathymetric contour lines, a small compass rose in one corner, gentle drop-shadow.`,
    `Show the reef shape, channels, drop-offs and notable features as a stylised aerial diagram.`,
    `Do NOT include any text, labels, numbers, watermarks or human figures.`,
    `Square 1:1 composition, centered, minimal background.`,
  ].join(' ');
}
