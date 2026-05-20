import type { DiveSite, Species } from '../types';

export const atolls = ['North Male', 'South Male', 'Ari', 'Baa', 'Lhaviyani', 'Vaavu', 'Addu', 'Fuvahmulah', 'Laamu', 'Noonu'];

export const seedSites: DiveSite[] = [
  { id: 'maaya-thila', name: 'Maaya Thila', atoll: 'Ari', type: 'Thila', difficulty: 'intermediate', depthMin: 6, depthMax: 30, current: 'moderate', bestSeason: 'Year round', isProtected: true, regulatedAccess: true, description: 'Iconic pinnacle known for reef sharks, turtles, and night dives.' },
  { id: 'banana-reef', name: 'Banana Reef', atoll: 'North Male', type: 'Reef', difficulty: 'beginner', depthMin: 5, depthMax: 30, current: 'mild', bestSeason: 'Nov-May', isProtected: true, description: 'Classic reef dive with overhangs, schooling fish, and reliable visibility.' },
  { id: 'kandooma-thila', name: 'Kandooma Thila', atoll: 'South Male', type: 'Channel', difficulty: 'advanced', depthMin: 12, depthMax: 30, current: 'strong', bestSeason: 'Jan-Apr', regulatedAccess: true, description: 'Current-rich site for experienced divers with grey reef sharks and eagle rays.' }
];

export const seedSpecies: Species[] = [
  { id: 'manta-ray', name: 'Reef Manta Ray', scientificName: 'Mobula alfredi', category: 'Ray', rarity: 'Uncommon', description: 'Large filter-feeding ray often seen at cleaning stations.' },
  { id: 'whale-shark', name: 'Whale Shark', scientificName: 'Rhincodon typus', category: 'Shark', rarity: 'Legendary', description: 'The largest fish in the sea and a South Ari highlight.' },
  { id: 'hawksbill', name: 'Hawksbill Turtle', scientificName: 'Eretmochelys imbricata', category: 'Reptile', rarity: 'Common', description: 'Reef turtle often seen feeding around coral structures.' }
];
