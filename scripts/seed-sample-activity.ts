import { execFileSync } from 'node:child_process';
import firebaseConfig from '../firebase-applet-config.json';
import { SEED_SITES_DATA } from '../src/data/seedSitesData';
import { Atoll, DebrisType, ReefHealthIndicator, UserRole } from '../src/types';

const DATABASE_ID = 'atollfeena';
const projectId = firebaseConfig.projectId;
const NOW = new Date();

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

type SampleUser = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  accessStatus: 'active';
  units: 'metric';
  homeCountry: string;
};

const sampleUsers: SampleUser[] = [
  {
    uid: 'sample-recreational-01',
    name: 'Aisha Rasheed',
    email: 'aisha.recreational@sample.atollfeena.app',
    role: 'recreational-diver',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
  },
  {
    uid: 'sample-verified-01',
    name: 'Shifan Ibrahim',
    email: 'shifan.verified@sample.atollfeena.app',
    role: 'verified-contributor',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
  },
  {
    uid: 'sample-professional-01',
    name: 'Nadheem Adam',
    email: 'nadheem.pro@sample.atollfeena.app',
    role: 'dive-professional',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
  },
  {
    uid: 'sample-manager-01',
    name: 'Lina Zahir',
    email: 'lina.manager@sample.atollfeena.app',
    role: 'dive-centre-manager',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
  },
  {
    uid: 'sample-reviewer-01',
    name: 'Dr. Mariyam Ismail',
    email: 'mariyam.reviewer@sample.atollfeena.app',
    role: 'marine-science-reviewer',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
  },
  {
    uid: 'sample-admin-01',
    name: 'AtollFeeNa Admin',
    email: 'admin@sample.atollfeena.app',
    role: 'platform-admin',
    accessStatus: 'active',
    units: 'metric',
    homeCountry: 'Maldives',
  },
];

const hazardPool = [
  'down current',
  'boat traffic',
  'surface chop',
  'sharp coral',
  'low visibility',
  'lost line',
];
const reefPool: ReefHealthIndicator[] = [
  'healthy coral',
  'bleaching',
  'broken coral',
  'algae overgrowth',
  'crown-of-thorns',
  'sedimentation',
];
const debrisPool: DebrisType[] = [
  'plastic',
  'fishing line',
  'ghost net',
  'metal',
  'glass',
  'other',
];
const islands = [
  'Hulhumale',
  'Maafushi',
  'Dhiffushi',
  'Dhangethi',
  'Hanifaru',
  'Rasdhoo',
  'Fuvahmulah',
  'Hithadhoo',
];
const surfaceStates = ['calm', 'choppy', 'rough', 'unknown'] as const;
const currentDirections = ['incoming', 'outgoing', 'cross', 'variable', 'none', 'unknown'] as const;
const currents = ['none', 'mild', 'moderate', 'strong', 'very strong', 'unknown'] as const;
const surges = ['none', 'mild', 'moderate', 'strong', 'unknown'] as const;
const entryStates = ['easy', 'manageable', 'challenging', 'hazardous', 'unknown'] as const;
const visibilities = [6, 8, 10, 14, 18, 22, 26, 30];
const waterTemps = [27, 28, 29, 30];
const preferredDemoSiteIds = [
  'banana-reef',
  'maaya-thila',
  'hanifaru-bay',
  'fuvahmulah-tiger-zoo',
  'british-loyalty-wreck',
  'orimas-thila',
  'manta-point-addu',
  'fotteyo-kandu',
].filter((id) => SEED_SITES_DATA.some((site) => site.id === id));
const preferredDemoSites = preferredDemoSiteIds
  .map((id) => SEED_SITES_DATA.find((site) => site.id === id))
  .filter((site): site is (typeof SEED_SITES_DATA)[number] => Boolean(site));
const regionalDemoSites = SEED_SITES_DATA.filter((site) =>
  ['North Malé', 'South Malé', 'North Ari', 'South Ari', 'Baa', 'Vaavu', 'Fuvahmulah', 'Addu'].includes(site.atoll)
);
const siteChoices = [...preferredDemoSites, ...regionalDemoSites.filter((site) => !preferredDemoSiteIds.includes(site.id))].slice(0, 28);

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

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const getAccessToken = () =>
  execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim();

const commitWrites = async (token: string, writes: unknown[]) => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents:commit`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ writes }),
    }
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }
};

function isoDaysAgo(daysAgo: number, hourOffset = 8) {
  const date = new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  date.setUTCHours((hourOffset + (daysAgo % 10)) % 24, (daysAgo * 7) % 60, 0, 0);
  return date.toISOString();
}

function buildSampleDiveLog(index: number) {
  const site = siteChoices[index % siteChoices.length];
  const user = sampleUsers[index % sampleUsers.length];
  const daysAgo = index % 30;
  const createdAt = isoDaysAgo(daysAgo, 7);
  const current = currents[index % currents.length];
  const visibility = visibilities[index % visibilities.length];
  const hazards =
    index % 3 === 0 ? [hazardPool[index % hazardPool.length]] : index % 7 === 0 ? ['low visibility'] : [];
  const reefSignals = [reefPool[index % reefPool.length]];
  const debrisSignals = index % 2 === 0 ? [debrisPool[index % debrisPool.length]] : [];
  const speciesCount = 2 + (index % 4);
  const privacy = index % 10 === 0 ? 'hide diver identity' : 'public aggregate';
  const logId = `sample-log-${String(index + 1).padStart(3, '0')}`;

  return {
    logId,
    reportId: `sample-report-${String(index + 1).padStart(3, '0')}`,
    diveLog: {
      userId: user.uid,
      diveNumber: index + 1,
      date: createdAt.slice(0, 10),
      startTime: createdAt.slice(11, 16),
      duration: 42 + (index % 26),
      maxDepth: 14 + (index % 20),
      avgDepth: 10 + (index % 14),
      siteId: site.id,
      customSiteName: site.name,
      atoll: site.atoll as Atoll,
      island: islands[index % islands.length],
      waterTemp: waterTemps[index % waterTemps.length],
      visibility,
      current,
      siteConditions: {
        visibilityMeters: visibility,
        current,
        currentDirection: currentDirections[index % currentDirections.length],
        surge: surges[index % surges.length],
        waterTempC: waterTemps[index % waterTemps.length],
        thermoclineDepthMeters: index % 5 === 0 ? 16 + (index % 6) : undefined,
        surfaceConditions: surfaceStates[index % surfaceStates.length],
        weatherNotes: index % 4 === 0 ? 'Light swell and moderate wind.' : '',
        entryExitDifficulty: entryStates[index % entryStates.length],
        hazards,
        hazardNotes: hazards.length > 0 ? `Reported by ${user.name}` : '',
        reportTime: createdAt,
      },
      speciesObservations: Array.from({ length: speciesCount }).map((_, itemIndex) => ({
        id: `${logId}-species-${itemIndex + 1}`,
        speciesName: site.marineLifeHighlights[itemIndex % site.marineLifeHighlights.length] || 'Reef fish',
        confidence: itemIndex % 2 === 0 ? 'high' : 'medium',
        hasMediaEvidence: itemIndex % 3 === 0,
      })),
      reefHealthObservations: reefSignals.map((signal, itemIndex) => ({
        id: `${logId}-reef-${itemIndex + 1}`,
        indicator: signal,
        severity: index % 3 === 0 ? 'moderate' : 'low',
        hasMediaEvidence: index % 4 === 0,
      })),
      debrisObservations: debrisSignals.map((signal, itemIndex) => ({
        id: `${logId}-debris-${itemIndex + 1}`,
        type: signal,
        amount: index % 3 === 0 ? 'many items' : 'few items',
        removed: index % 4 === 0,
        hasMediaEvidence: index % 2 === 0,
      })),
      observationMetadata: {
        source: 'diver',
        verificationStatus: index % 5 === 0 ? 'needs review' : 'unverified',
        privacy,
      },
      entryType: index % 3 === 0 ? 'shore' : 'boat',
      diveTypes: ['reef', index % 4 === 0 ? 'drift' : 'training'],
      gasType: 'air',
      oxygenPercent: 21,
      tankSize: 12,
      startPressure: 200,
      endPressure: 70 + (index % 30),
      safetyStop: true,
      marineLife: site.marineLifeHighlights.slice(0, 4),
      notes: 'Sample seeded record for dashboard testing.',
      rating: 3 + (index % 3),
      syncStatus: 'synced',
      createdAt,
      updatedAt: createdAt,
    },
    siteConditionReport: {
      siteId: site.id,
      siteName: site.name,
      atoll: site.atoll as Atoll,
      island: islands[index % islands.length],
      sourceDiveLogId: logId,
      submittedBy: user.uid,
      contributorRole: user.role,
      visibilityMeters: visibility,
      current,
      currentDirection: currentDirections[index % currentDirections.length],
      surge: surges[index % surges.length],
      waterTempC: waterTemps[index % waterTemps.length],
      thermoclineDepthMeters: index % 5 === 0 ? 16 + (index % 6) : undefined,
      surfaceConditions: surfaceStates[index % surfaceStates.length],
      weatherNotes: index % 4 === 0 ? 'Light swell and moderate wind.' : '',
      entryExitDifficulty: entryStates[index % entryStates.length],
      hazards,
      hazardNotes: hazards.length > 0 ? `Flagged by ${user.role}` : '',
      reportTime: createdAt,
      reefHealthSignals: reefSignals,
      debrisSignals,
      speciesCount,
      mediaEvidenceCount: index % 2 === 0 ? 2 : 0,
      verificationStatus: index % 5 === 0 ? 'needs review' : 'unverified',
      privacy,
      createdAt,
    },
  };
}

async function main() {
  const token = getAccessToken();
  const writes: unknown[] = [];

  sampleUsers.forEach((user) => {
    writes.push(
      buildWrite('users', user.uid, {
        ...user,
        createdAt: isoDaysAgo(28),
        updatedAt: NOW.toISOString(),
      })
    );
  });

  const generatedLogs = Array.from({ length: 72 }).map((_, index) => buildSampleDiveLog(index));
  generatedLogs.forEach((item) => {
    writes.push(buildWrite('diveLogs', item.logId, item.diveLog));
    writes.push(buildWrite('siteConditionReports', item.reportId, { ...item.siteConditionReport, id: item.reportId }));
  });

  // Add a few explicit site metadata updates so dashboard "incomplete/missing" states are testable.
  const sketchSeedSites = siteChoices.slice(0, 14);
  sketchSeedSites.forEach((site, index) => {
    writes.push(
      buildWrite('diveSites', site.id, {
        descriptionGeneratedAt: isoDaysAgo(index + 1),
        descriptionGeneratedBy: 'sample-ai-review-workflow',
        descriptionSourceRefs: [
          { title: `${site.name} local dive briefing`, url: 'https://visitmaldives.com', domain: 'visitmaldives.com' },
          { title: `${site.atoll} marine conditions reference`, url: 'https://www.padi.com', domain: 'padi.com' },
        ],
        sketchInstructions:
          index % 3 === 0
            ? ''
            : `Top-down sketch guidance: include drop-off, coral bommies, and drift line for ${site.name}.`,
        sketchInstructionsUpdatedAt: NOW.toISOString(),
        aiSketchGeneratedAt: index % 4 === 0 ? isoDaysAgo(index + 2) : null,
        aiSketchPrompt: index % 4 === 0 ? `Sketch prompt placeholder for ${site.name}` : null,
        updatedAt: isoDaysAgo(index),
      })
    );
  });

  for (const batch of chunk(writes, 420)) {
    await commitWrites(token, batch);
  }

  console.log(
    `Seeded sample activity: ${sampleUsers.length} users, ${generatedLogs.length} dive logs, ${generatedLogs.length} site condition reports.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
