import { execFileSync } from 'node:child_process';
import firebaseConfig from '../firebase-applet-config.json';
import { SEED_SITES_DATA } from '../src/data/seedSitesData';

const DATABASE_ID = 'atollfeena';
const projectId = firebaseConfig.projectId;
const now = new Date().toISOString();
const sites = SEED_SITES_DATA.filter((site) =>
  ['North Malé', 'South Malé', 'North Ari', 'Baa'].includes(site.atoll)
).slice(0, 4);

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

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

const toFirestoreFields = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value)])
  );

const documentName = (collectionName: string, id: string) =>
  `projects/${projectId}/databases/${DATABASE_ID}/documents/${collectionName}/${id}`;

const buildWrite = (collectionName: string, id: string, data: Record<string, unknown>) => ({
  update: {
    name: documentName(collectionName, id),
    fields: toFirestoreFields({ ...data, id }),
  },
});

const getAccessToken = () =>
  execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim();

const commitWrites = async (token: string, writes: unknown[]) => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents:commit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes }),
    }
  );
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
};

const checklist = (prefix: string, labels: string[]) =>
  labels.map((label, index) => ({ id: `${prefix}-${index + 1}`, label, checked: index < 2, required: true }));

const users = [
  {
    uid: 'sample-pro-diver-01',
    name: 'Hana Shareef',
    email: 'hana.pro@sample.atollfeena.app',
    role: 'recreational-diver',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
    createdAt: now,
    updatedAt: now,
  },
  {
    uid: 'sample-pro-centre-01',
    name: 'North Male Dive Centre',
    email: 'ops.northmale@sample.atollfeena.app',
    role: 'dive-centre-manager',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
    createdAt: now,
    updatedAt: now,
  },
];

const subscriptions = [
  {
    userId: 'sample-pro-diver-01',
    tier: 'individual-diver-pro',
    status: 'active',
    provider: 'bank-of-maldives',
    sourceTransactionId: 'sample-bml-individual-success',
    currentPeriodStart: now,
    verifiedAt: now,
    verifiedBy: 'sample-admin-01',
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: 'sample-pro-centre-01',
    tier: 'dive-centre-pro',
    status: 'active',
    diveCentreId: 'north-male-blue-centre',
    diveCentreName: 'North Male Dive Centre',
    provider: 'bank-of-maldives',
    sourceTransactionId: 'sample-bml-centre-success',
    currentPeriodStart: now,
    verifiedAt: now,
    verifiedBy: 'sample-admin-01',
    createdAt: now,
    updatedAt: now,
  },
];

const payments = [
  {
    userId: 'sample-pro-diver-01',
    provider: 'bank-of-maldives',
    tier: 'individual-diver-pro',
    status: 'successful',
    amountMvr: 150,
    currency: 'MVR',
    paymentMode: 'payment-request',
    externalReference: 'BML-SAMPLE-IND-001',
    verifiedAt: now,
    verifiedBy: 'sample-admin-01',
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: 'sample-pro-centre-01',
    provider: 'bank-of-maldives',
    tier: 'dive-centre-pro',
    status: 'successful',
    amountMvr: 750,
    currency: 'MVR',
    paymentMode: 'payment-request',
    externalReference: 'BML-SAMPLE-CENTRE-001',
    verifiedAt: now,
    verifiedBy: 'sample-admin-01',
    createdAt: now,
    updatedAt: now,
  },
];

const buildPlan = (index: number, ownerId: string, planType: 'individual' | 'dive-centre') => {
  const site = sites[index % sites.length];
  return {
    planType,
    ownerId,
    diveCentreId: planType === 'dive-centre' ? 'north-male-blue-centre' : undefined,
    diveCentreName: planType === 'dive-centre' ? 'North Male Dive Centre' : undefined,
    siteId: site.id,
    siteName: site.name,
    atoll: site.atoll,
    island: site.islandBase || 'Nearby island not set',
    plannedDate: '2026-06-12',
    plannedTime: index === 0 ? '09:00' : '14:00',
    plannedDepthMeters: index === 0 ? 18 : 24,
    plannedBottomTimeMinutes: index === 0 ? 45 : 38,
    gasType: index === 0 ? 'air' : 'nitrox 32',
    buddyDetails: planType === 'individual' ? 'Buddy: Adam, AOW certified' : '',
    participants: planType === 'dive-centre'
      ? [
          { id: 'p-1', name: 'Guide: Nadheem Adam', role: 'guide' },
          { id: 'p-2', name: 'Guest diver: Hana Shareef', role: 'diver' },
        ]
      : [{ id: 'p-1', name: 'Adam', role: 'buddy' }],
    equipmentChecklist: checklist('equipment', ['BCD', 'Regulator', 'Mask and fins', 'SMB', 'Torch']),
    safetyChecklist: checklist('safety', ['Gas checked', 'Buddy procedure agreed', 'Current reviewed', 'Emergency contact confirmed']),
    nearestSupport: site.islandBase || site.atoll,
    briefingNotes: 'Review entry point, expected current, no-touch reef behaviour, and SMB deployment.',
    operationalNotes: planType === 'dive-centre' ? 'Assign one guide for four divers and confirm boat pickup line.' : '',
    emergencyPlan: 'Contact dive centre surface support and route to nearest medical support if required.',
    status: index === 0 ? 'draft' : 'confirmed',
    createdAt: now,
    updatedAt: now,
  };
};

const main = async () => {
  const token = getAccessToken();
  const userWrites = users.map((user) => buildWrite('users', user.uid, user));
  const subWrites = subscriptions.map((sub) => buildWrite('proSubscriptions', sub.userId, sub));
  const paymentWrites = payments.map((payment) =>
    buildWrite('paymentTransactions', payment.externalReference, payment)
  );
  const planWrites = [
    buildWrite('divePlans', 'sample-individual-plan-01', buildPlan(0, 'sample-pro-diver-01', 'individual')),
    buildWrite('divePlans', 'sample-centre-plan-01', buildPlan(1, 'sample-pro-centre-01', 'dive-centre')),
  ];

  await commitWrites(token, [...userWrites, ...subWrites, ...paymentWrites, ...planWrites]);
  console.log('Seeded Pro users, subscriptions, BML payment records, and sample dive plans.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
