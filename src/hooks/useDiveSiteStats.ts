import { useEffect, useMemo, useState } from 'react';
import { QueryConstraint, collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Atoll, DiveSite } from '../types';

interface DiveSiteStatsInput {
  atoll: Atoll | 'All';
  loadedSites: DiveSite[];
  atollCount: number;
}

export function useDiveSiteStats({ atoll, loadedSites, atollCount }: DiveSiteStatsInput) {
  const [siteCount, setSiteCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    if (!db) {
      setSiteCount(null);
      return;
    }

    let cancelled = false;
    const loadCount = async () => {
      setLoadingCount(true);
      const constraints: QueryConstraint[] = [];
      if (atoll !== 'All') constraints.push(where('atoll', '==', atoll));
      const snapshot = await getCountFromServer(query(collection(db, 'diveSites'), ...constraints));
      if (!cancelled) {
        setSiteCount(snapshot.data().count);
        setLoadingCount(false);
      }
    };

    loadCount().catch(() => {
      if (!cancelled) {
        setSiteCount(null);
        setLoadingCount(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [atoll]);

  return useMemo(() => {
    const islands = new Set(loadedSites.map((site) => site.islandBase).filter(Boolean)).size;
    const mapped = loadedSites.filter((site) => site.coordinates).length;
    const protectedSites = loadedSites.filter((site) => site.isProtected).length;
    const strongerCurrent = loadedSites.filter(
      (site) => site.current === 'strong' || site.current === 'very strong'
    ).length;

    return {
      loadingCount,
      stats: [
        { label: atoll === 'All' ? 'Dive Sites' : 'Sites in Atoll', value: siteCount ?? loadedSites.length },
        { label: 'Loaded', value: loadedSites.length },
        { label: 'Atolls', value: atoll === 'All' ? atollCount : 1 },
        { label: 'Islands', value: islands },
        { label: 'Mapped', value: mapped },
        { label: 'Protected', value: protectedSites },
        { label: 'Stronger Current', value: strongerCurrent },
      ],
    };
  }, [atoll, atollCount, loadedSites, loadingCount, siteCount]);
}
