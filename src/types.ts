export type Role = 'visitor' | 'member' | 'pro' | 'admin' | 'kb_uploader' | 'kb_reviewer';
export type Tab = 'home' | 'sites' | 'team' | 'quick' | 'logbook' | 'profile' | 'settings' | 'insights' | 'species' | 'watch' | 'kb' | 'guide';

export type UserProfile = {
  uid: string; name: string; email: string; photoURL?: string; homeCountry?: string;
  units?: 'metric' | 'imperial'; safetyAgreedAt?: string; roles?: Role[];
  certificationProfile?: { agency?: string; level?: string; certificationNumber?: string; issueDate?: string; instructorName?: string };
  updatedAt?: unknown;
};

export type DiveLog = {
  id: string; userId: string; diveNumber: number; date: string; startTime?: string; duration: number; maxDepth: number;
  avgDepth?: number; siteId?: string; customSiteName?: string; atoll: string; island?: string; waterTemp?: number;
  visibility?: number; current?: 'none' | 'mild' | 'moderate' | 'strong' | 'very strong' | 'unknown';
  entryType?: 'boat' | 'shore' | 'jetty'; diveTypes?: string[]; gasType?: string; oxygenPercent?: number; tankSize?: number;
  startPressure?: number; endPressure?: number; sac?: number; surfaceInterval?: string; safetyStop?: boolean;
  marineLife?: string[]; notes?: string; rating?: number; buddyNames?: string[]; diveCenter?: string; instructorName?: string;
  teamDiveId?: string; teamDiveTitle?: string; teamDiveRole?: string; isVerified?: boolean; equipment?: string[]; media?: MediaItem[];
  syncStatus?: 'synced' | 'pending'; createdAt?: unknown; updatedAt?: unknown;
};

export type DiveSite = {
  id: string; name: string; atoll: string; islandBase?: string; type?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; depthMin?: number; depthMax?: number;
  current?: string; marineLifeHighlights?: string[]; bestSeason?: string; description?: string;
  isProtected?: boolean; regulatedAccess?: boolean; createdBy?: string; updatedAt?: unknown;
};

export type Species = {
  id: string; name: string; scientificName?: string; category: 'Shark' | 'Ray' | 'Fish' | 'Macro' | 'Reptile' | 'Other';
  description?: string; imageUrl?: string; rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'; createdBy?: string; updatedAt?: unknown;
};

export type TeamDive = {
  id: string; title: string; siteId?: string; customSiteName?: string; atoll?: string; island?: string; date: string;
  plannedTime?: string; diveType?: 'recreational' | 'training' | 'guided' | 'fun' | 'other'; plannedMaxDepth?: number;
  plannedBottomTime?: number; gasType?: string; oxygenPercent?: number; visibility?: number; current?: string; notes?: string;
  ownerId: string; ownerName?: string; memberIds: string[]; status: 'draft' | 'planned' | 'completed' | 'cancelled';
  checklist?: Record<string, boolean>; buddyPairs?: string[]; createdAt?: unknown; updatedAt?: unknown;
};

export type MediaItem = { url: string; path: string; type: 'image' | 'video'; name: string };
