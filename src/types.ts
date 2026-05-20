export type Atoll = 
  | 'North Malé' | 'South Malé' | 'North Ari' | 'South Ari' 
  | 'Baa' | 'Lhaviyani' | 'Vaavu' | 'Meemu' | 'Faafu' 
  | 'Dhaalu' | 'Laamu' | 'Haa Alifu' | 'Haa Dhaalu' 
  | 'Raa' | 'Noonu' | 'Shaviyani' | 'Thaa' | 'Kaafu'
  | 'Gaafu Alifu' | 'Gaafu Dhaalu' 
  | 'Fuvahmulah' | 'Addu';

export type DiveType = 
  | 'reef' | 'thila' | 'kandu/channel' | 'wreck' | 'night' 
  | 'drift' | 'manta' | 'whale shark' | 'shark' | 'training' | 'photography';

export type CurrentStrength = 'none' | 'mild' | 'moderate' | 'strong' | 'very strong' | 'unknown';
export type SurgeStrength = 'none' | 'mild' | 'moderate' | 'strong' | 'unknown';
export type EntryExitDifficulty = 'easy' | 'manageable' | 'challenging' | 'hazardous' | 'unknown';
export type ObservationConfidence = 'low' | 'medium' | 'high';
export type ReefHealthIndicator =
  | 'healthy coral'
  | 'bleaching'
  | 'broken coral'
  | 'algae overgrowth'
  | 'crown-of-thorns'
  | 'sedimentation';
export type DebrisType =
  | 'plastic'
  | 'fishing line'
  | 'ghost net'
  | 'metal'
  | 'glass'
  | 'other';

export interface CertificationProfile {
  agency: string;
  level: string;
  certificationNumber?: string;
  issueDate?: string;
  instructorName?: string;
}

export interface DiveSite {
  id: string;
  name: string;
  atoll: Atoll;
  islandBase: string;
  region?: 'north' | 'central' | 'south';
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  depthMin: number;
  depthMax: number;
  current: CurrentStrength;
  visibility?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  marineLifeHighlights: string[];
  bestSeason?: string;
  description: string;
  isProtected?: boolean;
  regulatedAccess?: boolean;
  protectedStatus?: string;
  localName?: string;
  notes?: string;
  /** Cached AI-generated top-down sketch URL (Firebase Storage). */
  aiSketchUrl?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  homeCountry?: string;
  certificationProfile?: CertificationProfile;
  emergencyContact?: string;
  units: 'metric' | 'imperial';
}

export interface DiveSiteConditionReport {
  visibilityMeters?: number;
  current: CurrentStrength;
  surge?: SurgeStrength;
  waterTempC?: number;
  entryExitDifficulty?: EntryExitDifficulty;
  hazards?: string[];
  hazardNotes?: string;
  reportTime: string;
}

export interface SpeciesObservation {
  id: string;
  speciesName: string;
  scientificName?: string;
  category?: string;
  count?: number;
  confidence: ObservationConfidence;
  hasMediaEvidence?: boolean;
  sensitiveLocation?: boolean;
}

export interface ReefHealthObservation {
  id: string;
  indicator: ReefHealthIndicator;
  severity: 'low' | 'moderate' | 'high';
  notes?: string;
  hasMediaEvidence?: boolean;
}

export interface DebrisObservation {
  id: string;
  type: DebrisType;
  amount: 'single item' | 'few items' | 'many items';
  removed?: boolean;
  notes?: string;
  hasMediaEvidence?: boolean;
}

export interface ObservationMetadata {
  source: 'diver';
  verificationStatus: 'unverified' | 'needs review' | 'verified';
  privacy: 'public aggregate' | 'hide diver identity' | 'sensitive location';
}

export interface DiveLog {
  id: string;
  userId: string;
  diveNumber: number;
  date: string;
  startTime: string;
  duration: number;
  maxDepth: number;
  avgDepth?: number;
  siteId: string;
  customSiteName?: string;
  atoll: Atoll;
  island: string;
  waterTemp?: number;
  visibility?: number;
  current: CurrentStrength;
  siteConditions?: DiveSiteConditionReport;
  speciesObservations?: SpeciesObservation[];
  reefHealthObservations?: ReefHealthObservation[];
  debrisObservations?: DebrisObservation[];
  observationMetadata?: ObservationMetadata;
  entryType: 'boat' | 'shore' | 'jetty';
  diveTypes: DiveType[];
  gasType: string;
  oxygenPercent: number;
  tankSize: number;
  startPressure?: number;
  endPressure?: number;
  sac?: number;
  surfaceInterval?: number;
  safetyStop: boolean;
  marineLife: string[];
  notes: string;
  rating: number;
  buddyNames?: string[];
  diveCenter?: string;
  instructorName?: string;
  isVerified?: boolean;
  equipment?: {
    wetsuit?: string;
    weights?: number;
    bcd?: string;
    computer?: string;
  };
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    id: string;
  }>;
  syncStatus: 'synced' | 'pending';
}
