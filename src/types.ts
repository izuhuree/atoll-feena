export type Atoll = 
  | 'North Malé' | 'South Malé' | 'North Ari' | 'South Ari' 
  | 'Baa' | 'Lhaviyani' | 'Vaavu' | 'Meemu' | 'Faafu' 
  | 'Dhaalu' | 'Laamu' | 'Haa Alifu' | 'Haa Dhaalu' 
  | 'Raa' | 'Noonu' | 'Gaafu Alifu' | 'Gaafu Dhaalu' 
  | 'Fuvahmulah' | 'Addu';

export type DiveType = 
  | 'reef' | 'thila' | 'kandu/channel' | 'wreck' | 'night' 
  | 'drift' | 'manta' | 'whale shark' | 'shark' | 'training' | 'photography';

export type CurrentStrength = 'none' | 'mild' | 'moderate' | 'strong' | 'very strong' | 'unknown';

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
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  depthMin: number;
  depthMax: number;
  current: CurrentStrength;
  marineLifeHighlights: string[];
  bestSeason?: string;
  description: string;
  isProtected?: boolean;
  regulatedAccess?: boolean;
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
