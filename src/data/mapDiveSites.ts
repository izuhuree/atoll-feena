import { Atoll } from '../types';

/**
 * Curated dive-site dataset for the interactive Leaflet map. Coordinates are
 * approximations sourced from open dive-tourism guides and PADI charts; they
 * are good enough for visual clustering but should NOT be used for navigation.
 *
 * `kind` drives marker colour:
 *  - 'reef'    teal
 *  - 'drift'   blue
 *  - 'wreck'   orange
 *  - 'pelagic' green (mantas / sharks / open-ocean stations)
 */
export type DiveSiteKind = 'reef' | 'drift' | 'wreck' | 'pelagic';

export interface MapDiveSite {
  id: string;
  name: string;
  atoll: Atoll;
  lat: number;
  lng: number;
  depthMin: number;
  depthMax: number;
  kind: DiveSiteKind;
  bestFor: string;
  citizenScienceApp: 'DIVR' | 'PADI AWARE' | 'Diveboard';
}

export const MAP_DIVE_SITES: MapDiveSite[] = [
  // ── North Malé Atoll ──────────────────────────────────────────────
  {
    id: 'nm-banana-reef',
    name: 'Banana Reef',
    atoll: 'North Malé',
    lat: 4.2589,
    lng: 73.5256,
    depthMin: 5,
    depthMax: 30,
    kind: 'reef',
    bestFor: 'Coral gardens, overhangs, reef fish',
    citizenScienceApp: 'DIVR',
  },
  {
    id: 'nm-hp-reef',
    name: 'HP Reef (Rainbow Reef)',
    atoll: 'North Malé',
    lat: 4.345,
    lng: 73.567,
    depthMin: 10,
    depthMax: 35,
    kind: 'drift',
    bestFor: 'Soft corals, eagle rays, sharks',
    citizenScienceApp: 'PADI AWARE',
  },
  {
    id: 'nm-manta-point',
    name: 'Manta Point (Lankan Reef)',
    atoll: 'North Malé',
    lat: 4.265,
    lng: 73.59,
    depthMin: 8,
    depthMax: 25,
    kind: 'pelagic',
    bestFor: 'Manta ray cleaning station (May–Nov)',
    citizenScienceApp: 'DIVR',
  },
  // ── South Malé Atoll ──────────────────────────────────────────────
  {
    id: 'sm-cocoa-thila',
    name: 'Cocoa Thila',
    atoll: 'South Malé',
    lat: 3.94,
    lng: 73.48,
    depthMin: 12,
    depthMax: 35,
    kind: 'drift',
    bestFor: 'Grey reef sharks, schooling jacks',
    citizenScienceApp: 'Diveboard',
  },
  {
    id: 'sm-kuda-giri',
    name: 'Kuda Giri Wreck',
    atoll: 'South Malé',
    lat: 3.913,
    lng: 73.435,
    depthMin: 12,
    depthMax: 30,
    kind: 'wreck',
    bestFor: 'Cargo wreck + adjacent thila',
    citizenScienceApp: 'PADI AWARE',
  },
  // ── Ari Atoll ─────────────────────────────────────────────────────
  {
    id: 'ari-fish-head',
    name: 'Fish Head (Mushimasmingili Thila)',
    atoll: 'North Ari',
    lat: 4.041,
    lng: 72.916,
    depthMin: 10,
    depthMax: 40,
    kind: 'drift',
    bestFor: 'Grey reef sharks, napoleon wrasse',
    citizenScienceApp: 'PADI AWARE',
  },
  {
    id: 'ari-maaya-thila',
    name: 'Maaya Thila',
    atoll: 'North Ari',
    lat: 3.985,
    lng: 72.945,
    depthMin: 6,
    depthMax: 30,
    kind: 'reef',
    bestFor: 'Night dive — white tips, stingrays',
    citizenScienceApp: 'DIVR',
  },
  {
    id: 'ari-sun-island',
    name: 'Sun Island Outside',
    atoll: 'South Ari',
    lat: 3.493,
    lng: 72.866,
    depthMin: 5,
    depthMax: 30,
    kind: 'pelagic',
    bestFor: 'Whale sharks (year-round)',
    citizenScienceApp: 'DIVR',
  },
  // ── Baa Atoll (UNESCO Biosphere) ─────────────────────────────────
  {
    id: 'baa-hanifaru',
    name: 'Hanifaru Bay',
    atoll: 'Baa',
    lat: 5.18,
    lng: 73.13,
    depthMin: 1,
    depthMax: 15,
    kind: 'pelagic',
    bestFor: 'Manta + whale shark feeding aggregation (Jun–Nov)',
    citizenScienceApp: 'DIVR',
  },
  {
    id: 'baa-nelivaru',
    name: 'Nelivaru Thila',
    atoll: 'Baa',
    lat: 5.205,
    lng: 73.07,
    depthMin: 10,
    depthMax: 30,
    kind: 'reef',
    bestFor: 'Overhangs, frogfish, leaf scorpionfish',
    citizenScienceApp: 'PADI AWARE',
  },
  // ── Lhaviyani Atoll ───────────────────────────────────────────────
  {
    id: 'lh-kuredu-express',
    name: 'Kuredu Express',
    atoll: 'Lhaviyani',
    lat: 5.547,
    lng: 73.466,
    depthMin: 10,
    depthMax: 35,
    kind: 'drift',
    bestFor: 'Strong drift, grey reef sharks',
    citizenScienceApp: 'Diveboard',
  },
  {
    id: 'lh-shipyard',
    name: 'Shipyard Wrecks',
    atoll: 'Lhaviyani',
    lat: 5.572,
    lng: 73.498,
    depthMin: 5,
    depthMax: 30,
    kind: 'wreck',
    bestFor: 'Two upright wrecks, batfish, jacks',
    citizenScienceApp: 'PADI AWARE',
  },
];

export const KIND_META: Record<
  DiveSiteKind,
  { label: string; color: string; description: string }
> = {
  reef: {
    label: 'Reef',
    color: '#0d9488', // teal-600
    description: 'Coral garden / thila dives',
  },
  drift: {
    label: 'Drift',
    color: '#2563eb', // blue-600
    description: 'Channel & current dives',
  },
  wreck: {
    label: 'Wreck',
    color: '#ea580c', // orange-600
    description: 'Sunken vessels & structures',
  },
  pelagic: {
    label: 'Manta / Pelagic',
    color: '#16a34a', // green-600
    description: 'Cleaning stations & open-ocean stations',
  },
};
