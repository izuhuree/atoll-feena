export interface MarineLife {
  id: string;
  name: string;
  scientificName: string;
  category: 'Shark' | 'Ray' | 'Fish' | 'Macro' | 'Reptile' | 'Other';
  description: string;
  imageUrl?: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
}

export const MARINE_LIFE_DATABASE: MarineLife[] = [
  {
    id: 'whale-shark',
    name: 'Whale Shark',
    scientificName: 'Rhincodon typus',
    category: 'Shark',
    description: 'The largest known fish species. Gentle giants often found in South Ari Atoll year-round. Recognizable by their unique pattern of white spots.',
    rarity: 'Rare'
  },
  {
    id: 'reef-manta-ray',
    name: 'Reef Manta Ray',
    scientificName: 'Mobula alfredi',
    category: 'Ray',
    description: 'Intelligent and graceful filter feeders. Frequent visitors to cleaning stations across the Maldives, especially during monsoon shifts.',
    rarity: 'Uncommon'
  },
  {
    id: 'tiger-shark',
    name: 'Tiger Shark',
    scientificName: 'Galeocerdo cuvier',
    category: 'Shark',
    description: 'A large macropredator found reliably in Fuvahmulah. Known for their stripes and impressive size.',
    rarity: 'Rare'
  },
  {
    id: 'hawksbill-turtle',
    name: 'Hawksbill Turtle',
    scientificName: 'Eretmochelys imbricata',
    category: 'Reptile',
    description: 'Critically endangered but commonly seen on Maldivian reefs. They feed primarily on sea sponges.',
    rarity: 'Common'
  },
  {
    id: 'grey-reef-shark',
    name: 'Grey Reef Shark',
    scientificName: 'Carcharhinus amblyrhynchos',
    category: 'Shark',
    description: 'Social sharks often seen patrolling channel entrances in large numbers during incoming currents.',
    rarity: 'Common'
  },
  {
    id: 'napoleon-wrasse',
    name: 'Napoleon Wrasse',
    scientificName: 'Cheilinus undulatus',
    category: 'Fish',
    description: 'Huge, hump-headed fish that are surprisingly friendly. A protected species and a favorite encounter at "Fish Head".',
    rarity: 'Uncommon'
  },
  {
    id: 'clownfish',
    name: 'Clownfish',
    scientificName: 'Amphiprioninae',
    category: 'Fish',
    description: 'Symbiotic with sea anemones. Often found in shallow reefs, aggressively protecting their host anemone.',
    rarity: 'Common'
  },
  {
    id: 'lionfish',
    name: 'Lionfish',
    scientificName: 'Pterois',
    category: 'Fish',
    description: 'Beautiful but venomous. Often found hiding under overhangs or in crevices during the day.',
    rarity: 'Common'
  },
  {
    id: 'blacktip-reef-shark',
    name: 'Blacktip Reef Shark',
    scientificName: 'Carcharhinus melanopterus',
    category: 'Shark',
    description: 'Easily identified by the prominent black tips on their fins. Common in shallow lagoons and around house reefs.',
    rarity: 'Common'
  },
  {
    id: 'hammerhead-shark',
    name: 'Scalloped Hammerhead',
    scientificName: 'Sphyrna lewini',
    category: 'Shark',
    description: 'Distinctive hammer-shaped head. Famous sightings occur at dawn at Rasdhoo Hammerhead Point.',
    rarity: 'Legendary'
  },
  {
    id: 'eagle-ray',
    name: 'Spotted Eagle Ray',
    scientificName: 'Aetobatus narinari',
    category: 'Ray',
    description: 'Beautiful rays with white spots on a dark blue/black back. Often seen in schools along the reef edge.',
    rarity: 'Uncommon'
  },
  {
    id: 'giant-trevally',
    name: 'Giant Trevally',
    scientificName: 'Caranx ignobilis',
    category: 'Fish',
    description: 'Powerful apex predators. Known as "GT". They are often seen hunting schools of fusiliers in heavy currents.',
    rarity: 'Common'
  },
  {
    id: 'oriental-sweetlips',
    name: 'Oriental Sweetlips',
    scientificName: 'Plectorhinchus vittatus',
    category: 'Fish',
    description: 'Beautifully striped fish with thick lips. Often found in large, stationary schools under overhangs.',
    rarity: 'Common'
  },
  {
    id: 'ghost-pipefish',
    name: 'Harlequin Ghost Pipefish',
    scientificName: 'Solenostomus paradoxus',
    category: 'Macro',
    description: 'Master of camouflage. They mimic crinoids and are a prize find for macro photographers.',
    rarity: 'Rare'
  },
  {
    id: 'pikachu-nudibranch',
    name: 'Pikachu Nudibranch',
    scientificName: 'Thecacera pacifica',
    category: 'Macro',
    description: 'A striking yellow and blue nudibranch that resembles the Pokémon Pikachu. Found in sandy patches with hydroids.',
    rarity: 'Rare'
  },
  {
    id: 'green-turtle',
    name: 'Green Sea Turtle',
    scientificName: 'Chelonia mydas',
    category: 'Reptile',
    description: 'Larger than Hawksbills, these turtles are often found resting on shallow seagrass beds or reef flats.',
    rarity: 'Common'
  },
  {
    id: 'spinner-dolphin',
    name: 'Spinner Dolphin',
    scientificName: 'Stenella longirostris',
    category: 'Other',
    description: 'Famous for their acrobatic leaps and spins. Frequently seen in atoll channels during morning and evening.',
    rarity: 'Uncommon'
  }
];
