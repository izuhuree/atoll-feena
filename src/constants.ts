import { SEED_SITES_DATA } from './data/seedSitesData';
import { Atoll } from './types';

export const SEED_SITES = SEED_SITES_DATA;

/**
 * Canonical list of all 22 Maldivian atolls. Used by every dropdown
 * (QuickLog, DiveSites, Add-Site form, filters) so they stay in sync.
 */
export const ATOLLS: Atoll[] = [
  'North Malé',
  'South Malé',
  'North Ari',
  'South Ari',
  'Baa',
  'Lhaviyani',
  'Vaavu',
  'Meemu',
  'Faafu',
  'Dhaalu',
  'Laamu',
  'Haa Alifu',
  'Haa Dhaalu',
  'Raa',
  'Noonu',
  'Shaviyani',
  'Thaa',
  'Kaafu',
  'Gaafu Alifu',
  'Gaafu Dhaalu',
  'Fuvahmulah',
  'Addu',
];
