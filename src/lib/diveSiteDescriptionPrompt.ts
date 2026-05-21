import { DiveSite } from '../types';

export function buildDiveSiteDescriptionPrompt(site: Partial<DiveSite>) {
  const facts = [
    `Name: ${site.name || 'Unknown dive site'}`,
    `Atoll: ${site.atoll || 'Unknown atoll'}`,
    site.islandBase ? `Nearby island/base: ${site.islandBase}` : '',
    site.type ? `Site type: ${site.type}` : '',
    site.depthMin !== undefined || site.depthMax !== undefined
      ? `Known app depth range: ${site.depthMin ?? 'unknown'}-${site.depthMax ?? 'unknown'} m`
      : '',
    site.current ? `Known app current: ${site.current}` : '',
    site.visibility ? `Known app visibility: ${site.visibility} m` : '',
    site.description ? `Current app description: ${site.description}` : '',
  ].filter(Boolean).join('\n');

  return `
Use Google Search grounding to find at least five reliable, verifiable sources about this Maldives recreational scuba dive site.

Prioritise sources such as PADI, recognised local dive centres, resort dive centres, Maldives tourism boards, marine conservation organisations, scientific or protected-area references, and reputable dive guides.

Dive site facts from the app:
${facts}

Return only valid JSON with this shape:
{
  "description": "Concise practical description, 120-180 words.",
  "sources": [
    { "title": "Source title", "url": "https://example.com/page", "domain": "example.com" }
  ],
  "notes": "Short reviewer note about source confidence or gaps."
}

Description requirements:
- Use neutral, practical language for recreational divers.
- Focus on diver safety, conservation, conditions, reef structure, depth range, currents, visibility, entry/exit guidance, hazards, marine life, coral health or sensitivity, and responsible diving.
- Do not use marketing language.
- Do not invent exact facts if sources disagree or are weak.
- Include at least five source links.`;
}
