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
export type CurrentDirection = 'incoming' | 'outgoing' | 'cross' | 'variable' | 'none' | 'unknown';
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

export type UserRole =
  | 'recreational-diver'
  | 'verified-contributor'
  | 'dive-professional'
  | 'dive-centre-manager'
  | 'marine-science-reviewer'
  | 'platform-admin';

export type UserAccessStatus = 'active' | 'pending' | 'disabled' | 'invited';

export type DiveSiteSuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface DiveSite {
  id: string;
  name: string;
  atoll: Atoll;
  islandBase: string;
  region?: 'north' | 'central' | 'south';
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  depthMin?: number;
  depthMax?: number;
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
  sourceName?: string;
  sourceUrl?: string;
  sourceAtoll?: string;
  dataQuality?: 'name-atoll-only' | 'feature-tagged' | 'detailed';
  importedAt?: string;
  descriptionSourceRefs?: SourceReference[];
  descriptionGeneratedAt?: string;
  descriptionGeneratedBy?: string;
  sketchInstructions?: string;
  sketchInstructionsUpdatedAt?: string;
  /** Cached AI-generated top-down sketch URL (Firebase Storage). */
  aiSketchUrl?: string;
  aiSketchPrompt?: string;
  aiSketchGeneratedAt?: string;
}

export interface SourceReference {
  title: string;
  url: string;
  domain?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: UserRole;
  accessStatus?: UserAccessStatus;
  homeCountry?: string;
  certificationProfile?: CertificationProfile;
  emergencyContact?: string;
  units: 'metric' | 'imperial';
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  appName?: string;
  contributionReviewRequired?: boolean;
  sketchGenerationEnabled?: boolean;
  defaultSketchInstructionsFromDescription?: boolean;
  speciesObservationReviewRequired?: boolean;
  publicDiveDataDefault?: 'private' | 'public aggregate';
  dataExportEnabled?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export type ProTier = 'free' | 'individual-diver-pro' | 'dive-centre-pro';
export type ProSubscriptionStatus = 'inactive' | 'pending' | 'active' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled';
export type DivePlanStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';

export interface ProSubscription {
  id: string;
  userId: string;
  tier: ProTier;
  status: ProSubscriptionStatus;
  diveCentreId?: string;
  diveCentreName?: string;
  provider?: 'bank-of-maldives';
  sourceTransactionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  provider: 'bank-of-maldives';
  tier: Exclude<ProTier, 'free'>;
  status: PaymentStatus;
  amountMvr: number;
  currency: 'MVR';
  paymentMode: 'payment-request' | 'payment-gateway';
  externalReference?: string;
  externalPaymentUrl?: string;
  failureReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DivePlanParticipant {
  id: string;
  name: string;
  role: 'diver' | 'buddy' | 'guide' | 'instructor' | 'boat-crew';
  certificationLevel?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface DivePlanChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required?: boolean;
}

export interface DivePlan {
  id: string;
  planType: 'individual' | 'dive-centre';
  ownerId: string;
  diveCentreId?: string;
  diveCentreName?: string;
  siteId: string;
  siteName: string;
  atoll: Atoll;
  island: string;
  plannedDate: string;
  plannedTime: string;
  plannedDepthMeters: number;
  plannedBottomTimeMinutes: number;
  gasType: string;
  buddyDetails?: string;
  boatName?: string;
  assignedGuide?: string;
  assignedInstructor?: string;
  participants: DivePlanParticipant[];
  equipmentChecklist: DivePlanChecklistItem[];
  safetyChecklist: DivePlanChecklistItem[];
  emergencyContact?: string;
  nearestSupport?: string;
  operationalNotes?: string;
  briefingNotes?: string;
  emergencyPlan?: string;
  status: DivePlanStatus;
  duplicatedFromPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiveSiteConditionReport {
  visibilityMeters?: number;
  current: CurrentStrength;
  currentDirection?: CurrentDirection;
  surge?: SurgeStrength;
  waterTempC?: number;
  thermoclineDepthMeters?: number;
  surfaceConditions?: 'calm' | 'choppy' | 'rough' | 'unknown';
  weatherNotes?: string;
  entryExitDifficulty?: EntryExitDifficulty;
  hazards?: string[];
  hazardNotes?: string;
  reportTime: string;
}

export interface SiteConditionReport extends DiveSiteConditionReport {
  id: string;
  siteId: string;
  siteName: string;
  atoll: Atoll;
  island?: string;
  sourceDiveLogId: string;
  submittedBy: string;
  contributorRole?: UserRole;
  reefHealthSignals?: ReefHealthIndicator[];
  debrisSignals?: DebrisType[];
  speciesCount?: number;
  mediaEvidenceCount?: number;
  verificationStatus: ObservationMetadata['verificationStatus'];
  privacy: ObservationMetadata['privacy'];
  createdAt: string;
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
    storagePath?: string;
    contentType?: string;
    description?: string;
    observationRef?: string;
  }>;
  syncStatus: 'synced' | 'pending';
}

export interface DiveSiteEditSuggestion {
  id: string;
  siteId?: string;
  siteName: string;
  atoll: Atoll;
  proposedDescription?: string;
  proposedSite?: Partial<DiveSite>;
  status: DiveSiteSuggestionStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}
