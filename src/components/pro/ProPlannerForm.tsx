import { ReactNode, useEffect, useState } from 'react';
import { DiveSite, DivePlan, ProSubscription } from '../../types';
import { useSiteIntelligence } from '../../hooks/useSiteIntelligence';

const SAFETY_ITEMS = [
  'Dive computer and backup timing checked',
  'Gas supply and turn pressure agreed',
  'Buddy/team separation procedure agreed',
  'Current, visibility, and hazards reviewed',
  'Emergency contact and surface support confirmed',
];

const EQUIPMENT_ITEMS = ['BCD', 'Regulator', 'Mask and fins', 'SMB', 'Torch or signalling device'];
const fieldClass = 'min-h-[48px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-maldives-lagoon/20';

interface ProPlannerFormProps {
  sites: DiveSite[];
  subscription: ProSubscription;
  isSaving: boolean;
  onSave: (plan: DivePlan) => Promise<void>;
}

export function ProPlannerForm({ sites, subscription, isSaving, onSave }: ProPlannerFormProps) {
  const [siteId, setSiteId] = useState(sites[0]?.id || '');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plannedTime, setPlannedTime] = useState('09:00');
  const [depth, setDepth] = useState(18);
  const [bottomTime, setBottomTime] = useState(45);
  const [gasType, setGasType] = useState('air');
  const [buddyDetails, setBuddyDetails] = useState('');
  const [participants, setParticipants] = useState('');
  const [briefingNotes, setBriefingNotes] = useState('');
  const [emergencyPlan, setEmergencyPlan] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!siteId && sites[0]?.id) setSiteId(sites[0].id);
  }, [siteId, sites]);

  const selectedSite = sites.find((site) => site.id === siteId);
  const isDiveCentre = subscription.tier === 'dive-centre-pro';
  const siteIntel = useSiteIntelligence(siteId, Boolean(siteId));

  const handleSave = async () => {
    if (!selectedSite) {
      setStatusMessage('Select a dive site before saving.');
      return;
    }

    const now = new Date().toISOString();
    const id = `plan-${Date.now()}`;
    await onSave({
      id,
      planType: isDiveCentre ? 'dive-centre' : 'individual',
      ownerId: subscription.userId,
      diveCentreId: isDiveCentre ? subscription.diveCentreId || subscription.userId : undefined,
      diveCentreName: isDiveCentre ? subscription.diveCentreName || 'Dive Centre Pro' : undefined,
      siteId: selectedSite.id,
      siteName: selectedSite.name,
      atoll: selectedSite.atoll,
      island: selectedSite.islandBase || 'Nearby island not set',
      plannedDate,
      plannedTime,
      plannedDepthMeters: depth,
      plannedBottomTimeMinutes: bottomTime,
      gasType,
      buddyDetails,
      participants: parseParticipants(participants),
      equipmentChecklist: EQUIPMENT_ITEMS.map((label, index) => ({ id: `equipment-${index}`, label, checked: false, required: true })),
      safetyChecklist: SAFETY_ITEMS.map((label, index) => ({ id: `safety-${index}`, label, checked: false, required: true })),
      emergencyContact: '',
      nearestSupport: selectedSite.islandBase,
      briefingNotes,
      operationalNotes: isDiveCentre ? briefingNotes : '',
      emergencyPlan,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    setStatusMessage('Dive plan saved.');
  };

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">Plan workflow</p>
      <h2 className="mt-1 font-display text-xl font-bold text-maldives-deep">
        {isDiveCentre ? 'Create group dive plan' : 'Create personal dive plan'}
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Dive site">
          <select value={siteId} onChange={(event) => setSiteId(event.target.value)} className={fieldClass}>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name} - {site.atoll}</option>
            ))}
          </select>
        </Field>
        <Field label="Gas">
          <select value={gasType} onChange={(event) => setGasType(event.target.value)} className={fieldClass}>
            <option value="air">Air</option>
            <option value="nitrox 32">Nitrox 32</option>
            <option value="nitrox 36">Nitrox 36</option>
          </select>
        </Field>
        <Field label="Date">
          <input type="date" value={plannedDate} onChange={(event) => setPlannedDate(event.target.value)} className={fieldClass} />
        </Field>
        <Field label="Time">
          <input type="time" value={plannedTime} onChange={(event) => setPlannedTime(event.target.value)} className={fieldClass} />
        </Field>
        <Field label="Planned depth (m)">
          <input type="number" min={4} max={60} value={depth} onChange={(event) => setDepth(Number(event.target.value))} className={fieldClass} />
        </Field>
        <Field label="Bottom time (min)">
          <input type="number" min={1} max={300} value={bottomTime} onChange={(event) => setBottomTime(Number(event.target.value))} className={fieldClass} />
        </Field>
      </div>

      <div className="mt-4 rounded-3xl bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent site conditions</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniMetric label="Reports" value={String(siteIntel.summary.reportCount)} />
          <MiniMetric label="Visibility" value={siteIntel.summary.averageVisibility ? `${siteIntel.summary.averageVisibility}m` : selectedSite?.visibility || '--'} />
          <MiniMetric label="Current" value={siteIntel.summary.typicalCurrent || selectedSite?.current || '--'} />
          <MiniMetric label="Hazards" value={siteIntel.summary.topHazards[0]?.label || 'none'} />
        </div>
      </div>

      <Field label={isDiveCentre ? 'Divers, guides, instructors, or boat crew' : 'Buddy details'}>
        <textarea value={isDiveCentre ? participants : buddyDetails} onChange={(event) => isDiveCentre ? setParticipants(event.target.value) : setBuddyDetails(event.target.value)} className={`${fieldClass} min-h-[84px]`} placeholder={isDiveCentre ? 'One person per line' : 'Buddy name, contact, certification notes'} />
      </Field>
      <Field label={isDiveCentre ? 'Briefing and operational notes' : 'Planning notes'}>
        <textarea value={briefingNotes} onChange={(event) => setBriefingNotes(event.target.value)} className={`${fieldClass} min-h-[84px]`} />
      </Field>
      <Field label="Emergency plan">
        <textarea value={emergencyPlan} onChange={(event) => setEmergencyPlan(event.target.value)} className={`${fieldClass} min-h-[84px]`} />
      </Field>

      <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        Dive plans are guidance only. They do not replace certified dive training, dive computer
        limits, instructor judgement, or local dive-centre safety procedures.
      </div>

      {statusMessage && <p className="mt-3 text-xs font-semibold text-maldives-lagoon">{statusMessage}</p>}
      <button onClick={handleSave} disabled={isSaving} className="mt-5 min-h-[48px] w-full rounded-2xl bg-maldives-deep px-4 text-sm font-bold text-white disabled:opacity-60">
        {isSaving ? 'Saving...' : 'Save dive plan'}
      </button>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function parseParticipants(value: string) {
  return value
    .split('\n')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({ id: `participant-${index}`, name, role: 'diver' as const }));
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold capitalize text-maldives-deep">{value}</p>
    </div>
  );
}
