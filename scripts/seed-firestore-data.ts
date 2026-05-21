import { execFileSync } from 'node:child_process';
import firebaseConfig from '../firebase-applet-config.json';
import { SEED_SITES_DATA } from '../src/data/seedSitesData';
import { MARINE_LIFE_DATABASE } from '../src/data/marineLife';

const DATABASE_ID = 'atollfeena';
const projectId = firebaseConfig.projectId;
const atolls = [
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

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

const observationCatalog = [
  {
    id: 'currentStrength',
    label: 'Current strength',
    sortOrder: 10,
    options: ['none', 'mild', 'moderate', 'strong', 'very strong', 'unknown'],
  },
  {
    id: 'currentDirection',
    label: 'Current direction',
    sortOrder: 15,
    options: ['incoming', 'outgoing', 'cross', 'variable', 'none', 'unknown'],
  },
  {
    id: 'surge',
    label: 'Surge',
    sortOrder: 20,
    options: ['none', 'mild', 'moderate', 'strong', 'unknown'],
  },
  {
    id: 'surfaceConditions',
    label: 'Surface conditions',
    sortOrder: 25,
    options: ['calm', 'choppy', 'rough', 'unknown'],
  },
  {
    id: 'entryExitDifficulty',
    label: 'Entry and exit difficulty',
    sortOrder: 30,
    options: ['easy', 'manageable', 'challenging', 'hazardous', 'unknown'],
  },
  {
    id: 'hazards',
    label: 'Dive site hazards',
    sortOrder: 40,
    options: ['boat traffic', 'down current', 'low visibility', 'surface chop', 'sharp coral', 'lost line'],
  },
  {
    id: 'reefHealth',
    label: 'Reef health indicators',
    sortOrder: 50,
    options: ['healthy coral', 'bleaching', 'broken coral', 'algae overgrowth', 'crown-of-thorns', 'sedimentation'],
  },
  {
    id: 'debris',
    label: 'Debris types',
    sortOrder: 60,
    options: ['plastic', 'fishing line', 'ghost net', 'metal', 'glass', 'other'],
  },
];

const toFirestoreValue = (value: unknown): FirestoreValue => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, child]) => [
            key,
            toFirestoreValue(child),
          ])
        ),
      },
    };
  }
  return { stringValue: String(value) };
};

const toFirestoreFields = (data: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)]));

const documentName = (collectionName: string, id: string) =>
  `projects/${projectId}/databases/${DATABASE_ID}/documents/${collectionName}/${id}`;

const getAccessToken = () =>
  execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim();

const commitWrites = async (token: string, writes: unknown[]) => {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents:commit`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ writes }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }
};

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const buildWrite = (collectionName: string, id: string, data: Record<string, unknown>) => ({
  update: {
    name: documentName(collectionName, id),
    fields: toFirestoreFields({
      ...data,
      id,
      source: 'seed-script',
      updatedAt: new Date().toISOString(),
    }),
  },
});

const main = async () => {
  const token = getAccessToken();
  const atollWrites = atolls.map((name, index) =>
    buildWrite('atolls', name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), {
      name,
      sortOrder: index + 1,
    })
  );
  const siteWrites = SEED_SITES_DATA.map((site) => buildWrite('diveSites', site.id, { ...site }));
  const lifeWrites = MARINE_LIFE_DATABASE.map((life) => buildWrite('marineLife', life.id, { ...life }));
  const catalogWrites = observationCatalog.map((item) =>
    buildWrite('observationCatalog', item.id, item)
  );

  const writes = [...atollWrites, ...siteWrites, ...lifeWrites, ...catalogWrites];
  for (const batch of chunk(writes, 450)) {
    await commitWrites(token, batch);
  }

  console.log(
    `Seeded ${siteWrites.length} dive sites, ${lifeWrites.length} marine life records, ` +
      `${catalogWrites.length} observation catalogs, and ${atollWrites.length} atolls.`
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
