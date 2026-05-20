import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import firebaseConfig from '../firebase-applet-config.json';
import { Atoll, DiveSite } from '../src/types';

const DATABASE_ID = 'atollfeena';
const projectId = firebaseConfig.projectId;
const defaultInputPath = '/Users/izuhuree/Downloads/scraped.json';

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

type ScrapedSite = {
  name?: string | null;
  atoll?: string | null;
  profile_url?: string | null;
  details?: {
    atoll?: string | null;
    type?: string | null;
    depth_min?: number | null;
    depth_max?: number | null;
    features?: string | null;
    creatures?: string | null;
    description?: string | null;
  };
};

type ExistingSite = {
  id: string;
  name?: string;
  atoll?: string;
};

const atollAliases = new Map<string, Atoll>([
  ['North Male', 'North Malé'],
  ['South Male', 'South Malé'],
  ['Fuvamulah', 'Fuvahmulah'],
  ['Seenu', 'Addu'],
  ['Rasdhoo', 'North Ari'],
  ['Gaafu Alifu - Gaafu Dhaalu', 'Gaafu Alifu'],
  ['Gaafu Alifu / Dhaalu', 'Gaafu Alifu'],
  ['Gaafu Alifu / DhaaluNo', 'Gaafu Alifu'],
]);

const validAtolls = new Set<Atoll>([
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
]);

const getAccessToken = () =>
  execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim();

const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);

const normalizeKey = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizeAtoll = (sourceAtoll: string | null | undefined): Atoll | null => {
  if (!sourceAtoll) return null;
  const trimmed = sourceAtoll.trim();
  if (validAtolls.has(trimmed as Atoll)) return trimmed as Atoll;
  return atollAliases.get(trimmed) ?? null;
};

const inferType = (name: string, feature?: string | null) => {
  const text = `${name} ${feature ?? ''}`.toLowerCase();
  if (text.includes('kandu') || text.includes('channel')) return 'Kandu';
  if (text.includes('thila')) return 'Thila';
  if (text.includes('giri')) return 'Giri';
  if (text.includes('faru')) return 'Faru';
  if (text.includes('wreck')) return 'Wreck';
  if (text.includes('manta')) return 'Manta point';
  if (text.includes('shark')) return 'Shark point';
  return 'Dive site';
};

const featureHighlights = (feature?: string | null, creatures?: string | null) => {
  const values = [feature, creatures]
    .flatMap((value) => (value ?? '').split(/[,/;]+/))
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(values)].slice(0, 10);
};

const regionForAtoll = (atoll: Atoll): DiveSite['region'] => {
  if (['Haa Alifu', 'Haa Dhaalu', 'Shaviyani', 'Noonu', 'Raa'].includes(atoll)) return 'north';
  if (['Laamu', 'Thaa', 'Gaafu Alifu', 'Gaafu Dhaalu', 'Fuvahmulah', 'Addu'].includes(atoll)) return 'south';
  return 'central';
};

const toFirestoreValue = (value: unknown): FirestoreValue => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, toFirestoreValue(child)])
        ),
      },
    };
  }
  return { stringValue: String(value) };
};

const fromFirestoreValue = (value: FirestoreValue): unknown => {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  return undefined;
};

const toFirestoreFields = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value)])
  );

const documentName = (collectionName: string, id: string) =>
  `projects/${projectId}/databases/${DATABASE_ID}/documents/${collectionName}/${id}`;

const listExistingSites = async (token: string): Promise<ExistingSite[]> => {
  const docs: ExistingSite[] = [];
  let pageToken = '';
  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents/diveSites`
    );
    url.searchParams.set('pageSize', '1000');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
    const body = await response.json();
    for (const doc of body.documents ?? []) {
      const fields = doc.fields ?? {};
      docs.push({
        id: doc.name.split('/').pop(),
        name: fromFirestoreValue(fields.name),
        atoll: fromFirestoreValue(fields.atoll),
      } as ExistingSite);
    }
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return docs;
};

const buildSite = (row: ScrapedSite, importedAt: string): DiveSite | null => {
  const name = row.name?.trim();
  const sourceAtoll = (row.atoll ?? row.details?.atoll)?.trim();
  const atoll = normalizeAtoll(sourceAtoll);
  if (!name || !atoll) return null;

  const highlights = featureHighlights(row.details?.features, row.details?.creatures);
  const description = row.details?.description?.trim() || `Imported dive-site listing for ${name}.`;
  const id = `mc-${slugify(`${atoll}-${name}`)}`;
  return {
    id,
    name,
    atoll,
    islandBase: atoll,
    region: regionForAtoll(atoll),
    type: row.details?.type?.trim() || inferType(name, row.details?.features),
    difficulty: 'unknown',
    depthMin: row.details?.depth_min ?? undefined,
    depthMax: row.details?.depth_max ?? undefined,
    current: 'unknown',
    marineLifeHighlights: highlights,
    description,
    isProtected: false,
    regulatedAccess: false,
    sourceName: 'Maldives Complete scrape',
    sourceUrl: row.profile_url ?? undefined,
    sourceAtoll,
    dataQuality: highlights.length > 0 ? 'feature-tagged' : 'name-atoll-only',
    importedAt,
  };
};

const commitWrites = async (token: string, writes: unknown[]) => {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents:commit`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes }),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
};

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
};

const main = async () => {
  const inputPath = process.argv[2] ?? defaultInputPath;
  const rows = JSON.parse(readFileSync(inputPath, 'utf8')) as ScrapedSite[];
  const token = getAccessToken();
  const importedAt = new Date().toISOString();
  const existingKeys = new Set(
    (await listExistingSites(token)).map((site) => `${normalizeKey(site.name ?? '')}|${normalizeKey(site.atoll ?? '')}`)
  );

  const skipped = { duplicate: 0, unmappedAtoll: 0 };
  const candidates = rows
    .map((row) => buildSite(row, importedAt))
    .filter((site): site is DiveSite => {
      if (!site) {
        skipped.unmappedAtoll += 1;
        return false;
      }
      const key = `${normalizeKey(site.name)}|${normalizeKey(site.atoll)}`;
      if (existingKeys.has(key)) {
        skipped.duplicate += 1;
        return false;
      }
      existingKeys.add(key);
      return true;
    });

  const writes = candidates.map((site) => ({
    update: {
      name: documentName('diveSites', site.id),
      fields: toFirestoreFields({
        ...site,
        source: 'scraped-import',
        updatedAt: importedAt,
      }),
    },
  }));

  for (const batch of chunk(writes, 450)) await commitWrites(token, batch);

  console.log(
    `Imported ${writes.length} dive sites. Skipped ${skipped.duplicate} duplicates and ` +
      `${skipped.unmappedAtoll} records with unmapped atolls.`
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
