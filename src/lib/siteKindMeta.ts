export type DiveSiteKind = 'reef' | 'drift' | 'wreck' | 'pelagic';

export const KIND_META: Record<
  DiveSiteKind,
  { label: string; color: string; description: string }
> = {
  reef: {
    label: 'Reef',
    color: '#0d9488',
    description: 'Coral garden / thila dives',
  },
  drift: {
    label: 'Drift',
    color: '#2563eb',
    description: 'Channel & current dives',
  },
  wreck: {
    label: 'Wreck',
    color: '#ea580c',
    description: 'Sunken vessels & structures',
  },
  pelagic: {
    label: 'Manta / Pelagic',
    color: '#16a34a',
    description: 'Cleaning stations & open-ocean stations',
  },
};

export const getDiveSiteKind = (type?: string): DiveSiteKind => {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('wreck')) return 'wreck';
  if (normalized.includes('kandu') || normalized.includes('channel') || normalized.includes('drift')) {
    return 'drift';
  }
  if (
    normalized.includes('manta') ||
    normalized.includes('pelagic') ||
    normalized.includes('open water') ||
    normalized.includes('shark')
  ) {
    return 'pelagic';
  }
  return 'reef';
};
