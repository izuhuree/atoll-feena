import { useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CurrentStrength, SiteConditionReport } from '../types';

const RECENT_REPORT_LIMIT = 25;

export function useSiteIntelligence(siteId: string, enabled: boolean) {
  const [reports, setReports] = useState<SiteConditionReport[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !db || !siteId) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const reportsQuery = query(
      collection(db, 'siteConditionReports'),
      where('siteId', '==', siteId),
      orderBy('reportTime', 'desc'),
      limit(RECENT_REPORT_LIMIT)
    );

    return onSnapshot(
      reportsQuery,
      (snapshot) => {
        setReports(snapshot.docs.map((reportDoc) => ({ ...reportDoc.data(), id: reportDoc.id } as SiteConditionReport)));
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        try {
          handleFirestoreError(snapshotError, OperationType.LIST, 'siteConditionReports');
        } catch (wrappedError) {
          setError(wrappedError instanceof Error ? wrappedError.message : 'Unable to load site intelligence.');
        }
        setLoading(false);
      }
    );
  }, [enabled, siteId]);

  const summary = useMemo(() => {
    const visibilityValues = reports
      .map((report) => report.visibilityMeters)
      .filter((value): value is number => typeof value === 'number');
    const waterTemps = reports
      .map((report) => report.waterTempC)
      .filter((value): value is number => typeof value === 'number');
    const currentCounts = countValues(reports.map((report) => report.current));
    const hazardCounts = countValues(reports.flatMap((report) => report.hazards || []));
    const reefSignals = countValues(reports.flatMap((report) => report.reefHealthSignals || []));
    const debrisSignals = countValues(reports.flatMap((report) => report.debrisSignals || []));

    return {
      reportCount: reports.length,
      latestReportTime: reports[0]?.reportTime,
      averageVisibility: average(visibilityValues),
      averageWaterTemp: average(waterTemps),
      typicalCurrent: topValue(currentCounts) as CurrentStrength | undefined,
      topHazards: topEntries(hazardCounts, 3),
      reefSignals: topEntries(reefSignals, 3),
      debrisSignals: topEntries(debrisSignals, 3),
      confidence: reports.length >= 10 ? 'high' : reports.length >= 3 ? 'medium' : reports.length > 0 ? 'low' : 'none',
    };
  }, [reports]);

  return { reports, summary, loading, error };
}

function average(values: number[]) {
  if (values.length === 0) return undefined;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    if (!value || value === 'unknown') return counts;
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function topValue(counts: Record<string, number>) {
  return topEntries(counts, 1)[0]?.label;
}

function topEntries(counts: Record<string, number>, count: number) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([label, value]) => ({ label, value }));
}
