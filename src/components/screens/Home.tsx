import { ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  Activity,
  Anchor,
  AlertTriangle,
  ArrowRight,
  Compass,
  Droplets,
  Database,
  Fish,
  Leaf,
  LifeBuoy,
  Map,
  MapPinned,
  MapPin,
  Radar,
  ShieldAlert,
  ShipWheel,
  Thermometer,
  Trash2,
  Waves,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useHomeDashboard } from '../../hooks/useHomeDashboard';
import { MaldivesActivityMap } from '../home/MaldivesActivityMap';

interface HomeProps {
  user: User | null;
  onLogDive: () => void;
  onOpenInsights: () => void;
  onOpenGuide: () => void;
  onNavigate?: (tab: string) => void;
}

export function Home({ user, onLogDive, onOpenInsights, onOpenGuide, onNavigate }: HomeProps) {
  const firstName = user?.displayName?.split(' ')[0];
  const dashboard = useHomeDashboard();

  return (
    <div className="px-4 pt-8 pb-24 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="AtollFeeNa logo"
            className="h-11 w-11 rounded-2xl border border-slate-100 bg-white object-cover shadow-sm"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-maldives-turquoise">
              Maruhabaa{firstName ? `, ${firstName}` : ''}
            </p>
            <h1 className="truncate text-2xl font-display font-bold text-maldives-deep">
              AtollFeeNa
            </h1>
          </div>
        </div>
      </header>

      <HeroBanner onPrimaryAction={onLogDive} activityPoints={dashboard.activityMapPoints} />

      <section className="mt-6">
        <SectionHeading
          eyebrow="Last 30 Days"
          title="Recent Activity"
          description="A focused summary of recent dive, safety, and citizen-science contributions."
        />
        {dashboard.loading ? (
          <LoadingPanel label="Loading 30-day dashboard activity..." />
        ) : dashboard.error ? (
          <ErrorPanel message="Unable to load dashboard activity right now." />
        ) : dashboard.metrics.every((metric) => metric.value === 0) ? (
          <EmptyPanel message="No recent dive activity in the last 30 days." />
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {dashboard.metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-maldives-shallow/30 text-maldives-lagoon">
                  <MetricIcon label={metric.label} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-display font-bold text-maldives-deep">
                  {metric.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{metric.hint}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <DashboardCard
          icon={LifeBuoy}
          title="Dive Safety Summary"
          description="Where recent safety data exists so divers can plan better."
        >
          {dashboard.loading ? (
            <LoadingPanel label="Loading safety reports..." compact />
          ) : dashboard.safety.strongCurrentSites.length === 0 &&
            dashboard.safety.lowVisibilitySites.length === 0 &&
            dashboard.safety.recentHazards.length === 0 ? (
            <EmptyPanel message="No safety reports available yet." compact />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <QuickMetric
                  icon={Waves}
                  label="Strong current sites"
                  value={dashboard.safety.strongCurrentSites.length}
                />
                <QuickMetric
                  icon={Droplets}
                  label="Low visibility sites"
                  value={dashboard.safety.lowVisibilitySites.length}
                />
                <QuickMetric
                  icon={AlertTriangle}
                  label="Hazard types"
                  value={dashboard.safety.recentHazards.length}
                />
                <QuickMetric
                  icon={MapPinned}
                  label="Recently updated"
                  value={dashboard.safety.mostRecentlyUpdatedSites.length}
                />
              </div>
              <InfoList
                label="Sites with strong current reports"
                items={dashboard.safety.strongCurrentSites.map(
                  (item) => `${item.siteName} (${item.count})`
                )}
              />
              <InfoList
                label="Sites with low visibility reports"
                items={dashboard.safety.lowVisibilitySites.map(
                  (item) => `${item.siteName} (${item.count})`
                )}
              />
              <InfoList label="Recently reported hazards" items={dashboard.safety.recentHazards} />
              <InfoList
                label="Most recently updated dive sites"
                items={dashboard.safety.mostRecentlyUpdatedSites}
              />
              <InfoList
                label="Sites with stable recent conditions"
                items={dashboard.safety.stableSites.map(
                  (item) => `${item.siteName} (${item.reports})`
                )}
              />
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          icon={Fish}
          title="Conservation Summary"
          description="Recent coral, species, and debris activity from shared reports."
          compact
        >
          {dashboard.loading ? (
            <LoadingPanel label="Loading conservation summaries..." compact />
          ) : dashboard.conservation.coralSignals === 0 &&
            dashboard.conservation.debrisSignals === 0 &&
            dashboard.conservation.speciesSightings === 0 ? (
            <EmptyPanel message="No conservation observations submitted yet." compact />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <QuickMetric icon={Thermometer} label="Bleaching observations" value={dashboard.conservation.bleachingObservations} />
                <QuickMetric icon={Leaf} label="Coral health signals" value={dashboard.conservation.coralSignals} />
                <QuickMetric icon={Trash2} label="Debris reports" value={dashboard.conservation.debrisSignals} />
                <QuickMetric icon={Fish} label="Species sightings" value={dashboard.conservation.speciesSightings} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoList
                  label="Top conservation sites"
                  items={dashboard.conservation.topConservationSites.map(
                    (item) => `${item.siteName} (${item.count})`
                  )}
                  maxItems={3}
                  compact
                />
                <InfoList
                  label="Recent species activity"
                  items={dashboard.conservation.notableSpeciesActivity.map(
                    (item) => `${item.siteName} (${item.count})`
                  )}
                  maxItems={3}
                  compact
                />
              </div>
            </div>
          )}
        </DashboardCard>
      </section>

      <section className="mt-8">
        <DashboardCard
          icon={Map}
          title="Dive Site Insights"
          description="Recent site activity, data gaps, and profiles that need contribution."
          compact
        >
          {dashboard.loading ? (
            <LoadingPanel label="Loading dive site insights..." compact />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoList
                label="Recently updated"
                items={dashboard.siteInsights.recentlyUpdated.map((site) => site.name)}
                maxItems={3}
                compact
              />
              <InfoList
                label="Most reported"
                items={dashboard.siteInsights.mostReported.map(
                  (item) => `${item.siteName} (${item.reports})`
                )}
                maxItems={3}
                compact
              />
              <InfoList
                label="Needs more data"
                items={dashboard.siteInsights.needsMoreData.map((site) => site.name)}
                emptyText="No missing-data sites found in the sampled dashboard set."
                maxItems={3}
                compact
              />
              <InfoList
                label="Incomplete profiles"
                items={dashboard.siteInsights.incompleteProfiles.map((site) => site.name)}
                emptyText="No incomplete profiles found in the sampled dashboard set."
                maxItems={3}
                compact
              />
            </div>
          )}
        </DashboardCard>
      </section>

      <section className="mt-8 grid grid-cols-3 gap-3">
        <ActionTile
          icon={ShipWheel}
          title="Log Dive"
          subtitle="Add reef and safety data"
          onClick={onLogDive}
        />
        <ActionTile
          icon={Radar}
          title="Insights"
          subtitle="Review your dive trends"
          onClick={onOpenInsights}
        />
        <ActionTile
          icon={MapPinned}
          title="Sites"
          subtitle="View site intelligence"
          onClick={() => onNavigate?.('sites')}
        />
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <ActionTile
          icon={Anchor}
          title="Logbook"
          subtitle="Your saved dive records"
          onClick={() => onNavigate?.('logbook')}
          compact
        />
        <ActionTile
          icon={Fish}
          title="Field Guide"
          subtitle="Species and IDs"
          onClick={onOpenGuide}
          compact
        />
      </section>
    </div>
  );
}

function HeroBanner({
  onPrimaryAction,
  activityPoints,
}: {
  onPrimaryAction: () => void;
  activityPoints: Array<{ id: string; name: string; atoll: string; lat: number; lng: number; reports: number }>;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 px-5 py-8 text-white shadow-lg shadow-teal-900/15 sm:px-8 sm:py-10"
    >
      <MaldivesActivityMap points={activityPoints} />
      <div className="relative z-10 max-w-3xl">
      <h2 className="text-3xl font-display font-bold leading-tight sm:text-4xl">
        Start Contributing Today
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base">
        Create your free AtollFeeNa account and turn every dive into valuable reef, safety, and
        conservation data. Log your dives, improve site knowledge, and help the next diver enter
        better prepared.
      </p>
      <button
        onClick={onPrimaryAction}
        className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-teal-700 active:scale-[0.98]"
      >
        Log Your First Dive
        <ArrowRight className="h-4 w-4" />
      </button>
      </div>
    </motion.section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">{eyebrow}</p>
      <h3 className="mt-1 text-2xl font-display font-bold text-maldives-deep">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  description,
  children,
  compact = false,
}: {
  icon: typeof ShieldAlert;
  title: string;
  description: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <article className={`rounded-3xl border border-slate-100 bg-white shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      <div className={`flex items-start gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="rounded-2xl bg-slate-50 p-2.5 shrink-0">
          <Icon className="h-5 w-5 text-maldives-lagoon" />
        </div>
        <div>
          <h4 className={`${compact ? 'text-base' : 'text-lg'} font-display font-bold text-maldives-deep`}>{title}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function InfoList({
  label,
  items,
  emptyText = 'No recent items.',
  maxItems,
  compact = false,
}: {
  label: string;
  items: string[];
  emptyText?: string;
  maxItems?: number;
  compact?: boolean;
}) {
  const visibleItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {visibleItems.length === 0 ? (
        <p className="mt-1 text-xs text-slate-500">{emptyText}</p>
      ) : (
        <ul className={`mt-2 ${compact ? 'space-y-1' : 'space-y-1.5'}`}>
          {visibleItems.map((item) => (
            <li key={`${label}-${item}`} className={`rounded-xl bg-slate-50 px-3 text-xs font-semibold text-slate-700 ${compact ? 'py-1.5' : 'py-2'}`}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  subtitle,
  onClick,
  compact = false,
}: {
  icon: typeof Waves;
  title: string;
  subtitle: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-slate-100 bg-white text-left shadow-sm active:scale-[0.98] ${compact ? 'p-3' : 'p-4'}`}
    >
      <Icon className={`text-maldives-lagoon ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
      <p className={`mt-2 font-display font-bold text-maldives-deep ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </p>
      <p className={`text-slate-500 ${compact ? 'text-[11px]' : 'text-xs'}`}>{subtitle}</p>
    </button>
  );
}

function LoadingPanel({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-50 text-slate-500 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}>
      {label}
    </div>
  );
}

function EmptyPanel({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}>
      {message}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
      {message}
    </div>
  );
}

function QuickMetric({ icon: Icon, label, value }: { icon: typeof Waves; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <Icon className="mb-1.5 h-4 w-4 text-maldives-lagoon" />
      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-tight">{label}</p>
      <p className="mt-1 text-lg font-display font-bold text-maldives-deep">{value}</p>
    </div>
  );
}

function MetricIcon({ label }: { label: string }) {
  const Icon =
    label.includes('Dive Logs') ? ShipWheel :
    label.includes('Active Dive Sites') ? MapPinned :
    label.includes('Atolls') ? Map :
    label.includes('Species') ? Fish :
    label.includes('Coral') ? Leaf :
    label.includes('Debris') ? Trash2 :
    label.includes('Safety') ? LifeBuoy :
    AlertTriangle;

  return <Icon className="h-4 w-4" />;
}
