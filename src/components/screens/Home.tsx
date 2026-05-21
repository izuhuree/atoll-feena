import { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Anchor,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Fish,
  Crown,
  Leaf,
  LifeBuoy,
  Map,
  MapPinned,
  Radar,
  ShipWheel,
  Thermometer,
  Trash2,
  Waves,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useHomeDashboard } from '../../hooks/useHomeDashboard';
import {
  ActionTile,
  DashboardCard,
  EmptyPanel,
  ErrorPanel,
  InfoList,
  LoadingPanel,
  MetricIcon,
  QuickMetric,
  SectionHeading,
  SeeMoreButton,
} from '../home/HomeDashboardUi';
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
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [showSafetyDetails, setShowSafetyDetails] = useState(false);
  const [showConservationDetails, setShowConservationDetails] = useState(false);
  const [showSiteDetails, setShowSiteDetails] = useState(false);
  const visibleMetrics = showAllMetrics ? dashboard.metrics : dashboard.metrics.slice(0, 4);

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
          <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {visibleMetrics.map((metric) => (
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
          {dashboard.metrics.length > 4 && (
            <SeeMoreButton
              expanded={showAllMetrics}
              onClick={() => setShowAllMetrics((value) => !value)}
              moreLabel="See all activity"
              lessLabel="Show key activity"
            />
          )}
          </>
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
                label="Priority safety signals"
                items={[
                  ...dashboard.safety.strongCurrentSites.map((item) => `${item.siteName} strong current (${item.count})`),
                  ...dashboard.safety.lowVisibilitySites.map((item) => `${item.siteName} low visibility (${item.count})`),
                  ...dashboard.safety.recentHazards.map((item) => `Hazard: ${item}`),
                ]}
                maxItems={3}
                compact
              />
              {showSafetyDetails && (
                <div className="grid gap-3 sm:grid-cols-2">
              <InfoList
                label="Sites with strong current reports"
                items={dashboard.safety.strongCurrentSites.map(
                  (item) => `${item.siteName} (${item.count})`
                )}
                maxItems={3}
                compact
              />
              <InfoList
                label="Sites with low visibility reports"
                items={dashboard.safety.lowVisibilitySites.map(
                  (item) => `${item.siteName} (${item.count})`
                )}
                maxItems={3}
                compact
              />
              <InfoList label="Recently reported hazards" items={dashboard.safety.recentHazards} maxItems={3} compact />
              <InfoList
                label="Most recently updated dive sites"
                items={dashboard.safety.mostRecentlyUpdatedSites}
                maxItems={3}
                compact
              />
              <InfoList
                label="Sites with stable recent conditions"
                items={dashboard.safety.stableSites.map(
                  (item) => `${item.siteName} (${item.reports})`
                )}
                maxItems={3}
                compact
              />
                </div>
              )}
              <SeeMoreButton
                expanded={showSafetyDetails}
                onClick={() => setShowSafetyDetails((value) => !value)}
                moreLabel="See safety details"
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
              {showConservationDetails && (
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
              )}
              <SeeMoreButton
                expanded={showConservationDetails}
                onClick={() => setShowConservationDetails((value) => !value)}
                moreLabel="See conservation details"
              />
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
            <div>
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
              {showSiteDetails && (
                <>
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
                </>
              )}
            </div>
            <SeeMoreButton
              expanded={showSiteDetails}
              onClick={() => setShowSiteDetails((value) => !value)}
              moreLabel="See site gaps"
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

      <section className="mt-3">
        <ActionTile
          icon={Crown}
          title="Pro Planning"
          subtitle="Dive plans, checklists, and group briefings"
          onClick={() => onNavigate?.('pro')}
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
