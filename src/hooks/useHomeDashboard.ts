import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Atoll, DiveSite, SiteConditionReport } from '../types';

const HOME_REPORT_LIMIT = 400;
const HOME_SITE_LIMIT = 160;
const DAY_MS = 24 * 60 * 60 * 1000;

interface HomeDashboardData {
  loading: boolean;
  error: string | null;
  activityMapPoints: Array<{
    id: string;
    name: string;
    atoll: string;
    lat: number;
    lng: number;
    reports: number;
  }>;
  metrics: Array<{ label: string; value: number; hint: string }>;
  safety: {
    strongCurrentSites: Array<{ siteName: string; count: number }>;
    lowVisibilitySites: Array<{ siteName: string; count: number }>;
    recentHazards: string[];
    mostRecentlyUpdatedSites: string[];
    stableSites: Array<{ siteName: string; reports: number }>;
  };
  conservation: {
    bleachingObservations: number;
    coralSignals: number;
    debrisSignals: number;
    speciesSightings: number;
    topConservationSites: Array<{ siteName: string; count: number }>;
    notableSpeciesActivity: Array<{ siteName: string; count: number }>;
  };
  siteInsights: {
    recentlyUpdated: DiveSite[];
    mostReported: Array<{ siteName: string; reports: number }>;
    needsMoreData: DiveSite[];
    incompleteProfiles: DiveSite[];
  };
}

export function useHomeDashboard() {
  const [reports, setReports] = useState<SiteConditionReport[]>([]);
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [recentlyUpdatedSites, setRecentlyUpdatedSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      const cutoffIso = new Date(Date.now() - 30 * DAY_MS).toISOString();
      try {
        const [reportSnap, siteSnap, updatedSiteSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, 'siteConditionReports'),
              where('reportTime', '>=', cutoffIso),
              orderBy('reportTime', 'desc'),
              limit(HOME_REPORT_LIMIT)
            )
          ),
          getDocs(query(collection(db, 'diveSites'), orderBy('name'), limit(HOME_SITE_LIMIT))),
          getDocs(query(collection(db, 'diveSites'), orderBy('updatedAt', 'desc'), limit(8))),
        ]);

        setReports(
          reportSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SiteConditionReport))
        );
        setSites(siteSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DiveSite)));
        setRecentlyUpdatedSites(
          updatedSiteSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DiveSite))
        );
      } catch (loadError) {
        try {
          handleFirestoreError(loadError, OperationType.LIST, 'home-dashboard');
        } catch (wrappedError) {
          setError(
            wrappedError instanceof Error
              ? wrappedError.message
              : 'Failed to load dashboard data.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const data = useMemo<HomeDashboardData>(() => {
    const siteReportCounts = reports.reduce<Record<string, number>>((acc, report) => {
      const key = report.siteId || report.siteName;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const siteNameById = new Map<string, string>();
    reports.forEach((report) => {
      if (report.siteId) siteNameById.set(report.siteId, report.siteName);
    });
    sites.forEach((site) => siteNameById.set(site.id, site.name));
    const siteById = new Map(sites.map((site) => [site.id, site]));

    const activeSiteIds = new Set(reports.map((report) => report.siteId));
    const atolls = new Set(reports.map((report) => report.atoll));
    const speciesCount = reports.reduce((sum, report) => sum + (report.speciesCount || 0), 0);
    const coralCount = reports.reduce(
      (sum, report) => sum + (report.reefHealthSignals?.length || 0),
      0
    );
    const debrisCount = reports.reduce(
      (sum, report) => sum + (report.debrisSignals?.length || 0),
      0
    );
    const alertsCount = reports.filter(
      (report) =>
        (report.hazards?.length || 0) > 0 ||
        report.current === 'strong' ||
        report.current === 'very strong'
    ).length;

    const strongCurrentSites = topSites(
      reports.filter((report) => report.current === 'strong' || report.current === 'very strong')
    );
    const lowVisibilitySites = topSites(
      reports.filter(
        (report) =>
          typeof report.visibilityMeters === 'number' && report.visibilityMeters <= 10
      )
    );
    const recentHazards = topStrings(
      reports.flatMap((report) => report.hazards || []).filter(Boolean),
      4
    );
    const stableSites = topSites(
      reports.filter(
        (report) =>
          report.current !== 'strong' &&
          report.current !== 'very strong' &&
          (report.hazards?.length || 0) === 0 &&
          (report.visibilityMeters || 0) >= 15
      )
    ).map((item) => ({ siteName: item.siteName, reports: item.count }));

    const reefSignals = reports.flatMap((report) => report.reefHealthSignals || []);
    const bleachingObservations = reefSignals.filter((signal) => signal === 'bleaching').length;
    const conservationCounts = reports.map((report) => ({
      siteName: report.siteName,
      count: (report.reefHealthSignals?.length || 0) + (report.debrisSignals?.length || 0),
    }));
    const topConservationSites = aggregateSiteCounts(conservationCounts);
    const notableSpeciesActivity = aggregateSiteCounts(
      reports
        .filter((report) => (report.speciesCount || 0) > 0)
        .map((report) => ({ siteName: report.siteName, count: report.speciesCount || 0 }))
    );

    const mostReported = Object.entries(siteReportCounts)
      .map(([siteId, count]) => ({
        siteName: siteNameById.get(siteId) || siteId,
        reports: count,
      }))
      .sort((a, b) => b.reports - a.reports)
      .slice(0, 5);

    const needsMoreData = sites
      .filter((site) => !activeSiteIds.has(site.id))
      .slice(0, 5);
    const incompleteProfiles = sites
      .filter(
        (site) =>
          !site.description?.trim() ||
          !site.sketchInstructions?.trim() ||
          (site.dataQuality || 'name-atoll-only') !== 'detailed'
      )
      .slice(0, 5);

    return {
      loading,
      error,
      activityMapPoints: Object.entries(siteReportCounts)
        .map(([siteId, reports]) => {
          const site = siteById.get(siteId);
          if (!site?.coordinates) return null;
          return {
            id: site.id,
            name: site.name,
            atoll: site.atoll,
            lat: site.coordinates.lat,
            lng: site.coordinates.lng,
            reports,
          };
        })
        .filter((point): point is {
          id: string;
          name: string;
          atoll: Atoll;
          lat: number;
          lng: number;
          reports: number;
        } => Boolean(point))
        .sort((a, b) => b.reports - a.reports)
        .slice(0, 18),
      metrics: [
        {
          label: 'Dive Logs (30d)',
          value: reports.length,
          hint: 'Shared public reports from recent dives',
        },
        {
          label: 'Active Dive Sites',
          value: activeSiteIds.size,
          hint: 'Sites with recent diver updates',
        },
        {
          label: 'Active Atolls',
          value: atolls.size,
          hint: 'Atolls with recent activity',
        },
        {
          label: 'Species Observations',
          value: speciesCount,
          hint: 'Recent sightings submitted',
        },
        {
          label: 'Coral Health Signals',
          value: coralCount,
          hint: 'Reef condition observations',
        },
        {
          label: 'Debris Reports',
          value: debrisCount,
          hint: 'Marine debris/impact observations',
        },
        {
          label: 'Safety Updates',
          value: reports.length,
          hint: 'Condition updates in last 30 days',
        },
        {
          label: 'Hazard / Current Alerts',
          value: alertsCount,
          hint: 'Strong current or hazard flags',
        },
      ],
      safety: {
        strongCurrentSites,
        lowVisibilitySites,
        recentHazards,
        mostRecentlyUpdatedSites: recentlyUpdatedSites.map((site) => site.name).slice(0, 5),
        stableSites,
      },
      conservation: {
        bleachingObservations,
        coralSignals: coralCount,
        debrisSignals: debrisCount,
        speciesSightings: speciesCount,
        topConservationSites,
        notableSpeciesActivity,
      },
      siteInsights: {
        recentlyUpdated: recentlyUpdatedSites,
        mostReported,
        needsMoreData,
        incompleteProfiles,
      },
    };
  }, [error, loading, recentlyUpdatedSites, reports, sites]);

  return data;
}

function topSites(reports: SiteConditionReport[]) {
  return aggregateSiteCounts(reports.map((report) => ({ siteName: report.siteName, count: 1 })));
}

function aggregateSiteCounts(entries: Array<{ siteName: string; count: number }>) {
  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    if (!entry.siteName) return acc;
    acc[entry.siteName] = (acc[entry.siteName] || 0) + entry.count;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([siteName, count]) => ({ siteName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function topStrings(values: string[], limitCount: number) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    const key = value.trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limitCount)
    .map(([value]) => value);
}
