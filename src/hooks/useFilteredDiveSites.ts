import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Atoll, DiveSite } from '../types';

const PAGE_SIZE = 24;

interface DiveSiteFilters {
  atoll: Atoll | 'All';
  islandSearch: string;
  siteSearch: string;
}

const searchPrefix = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed[0].toUpperCase() + trimmed.slice(1) : '';
};

const includesText = (value: string | undefined, queryText: string) =>
  !queryText || value?.toLowerCase().includes(queryText.toLowerCase());

export function useFilteredDiveSites(filters: DiveSiteFilters) {
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const sitesRef = useRef<DiveSite[]>([]);
  const cacheRef = useRef(new Map<string, { sites: DiveSite[]; cursor: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }>());

  const hasFilter = filters.atoll !== 'All' ||
    filters.islandSearch.trim().length >= 2 ||
    filters.siteSearch.trim().length >= 2;

  const cacheKey = useMemo(
    () => JSON.stringify({
      atoll: filters.atoll,
      island: filters.islandSearch.trim().toLowerCase(),
      site: filters.siteSearch.trim().toLowerCase(),
    }),
    [filters.atoll, filters.islandSearch, filters.siteSearch]
  );

  const buildQuery = useCallback((cursor?: QueryDocumentSnapshot<DocumentData> | null) => {
    if (!db) return null;
    const constraints = [];
    const sitePrefix = searchPrefix(filters.siteSearch);
    const islandPrefix = searchPrefix(filters.islandSearch);

    if (filters.atoll !== 'All') constraints.push(where('atoll', '==', filters.atoll));

    if (sitePrefix) {
      constraints.push(orderBy('name'), startAt(sitePrefix), endAt(`${sitePrefix}\uf8ff`));
    } else if (islandPrefix) {
      constraints.push(orderBy('islandBase'), startAt(islandPrefix), endAt(`${islandPrefix}\uf8ff`));
    } else {
      constraints.push(orderBy('name'));
    }

    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(PAGE_SIZE));
    return query(collection(db, 'diveSites'), ...constraints);
  }, [filters.atoll, filters.islandSearch, filters.siteSearch]);

  const fetchPage = useCallback(async (mode: 'replace' | 'append') => {
    if (!hasFilter || !db) {
      setSites([]);
      sitesRef.current = [];
      setHasMore(false);
      cursorRef.current = null;
      return;
    }

    const cached = mode === 'replace' ? cacheRef.current.get(cacheKey) : null;
    if (cached) {
      setSites(cached.sites);
      sitesRef.current = cached.sites;
      setHasMore(cached.hasMore);
      cursorRef.current = cached.cursor;
      return;
    }

    const q = buildQuery(mode === 'append' ? cursorRef.current : null);
    if (!q) return;
    mode === 'append' ? setLoadingMore(true) : setLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(q);
      const page = snapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id } as DiveSite))
        .filter((site) => includesText(site.islandBase, filters.islandSearch))
        .filter((site) => includesText(site.name, filters.siteSearch))
        .sort((a, b) => a.name.localeCompare(b.name));
      const nextSites = mode === 'append' ? [...sitesRef.current, ...page] : page;
      const nextCursor = snapshot.docs[snapshot.docs.length - 1] ?? null;
      const nextHasMore = snapshot.docs.length === PAGE_SIZE;

      setSites(nextSites);
      sitesRef.current = nextSites;
      setHasMore(nextHasMore);
      cursorRef.current = nextCursor;
      cacheRef.current.set(cacheKey, { sites: nextSites, cursor: nextCursor, hasMore: nextHasMore });
    } catch (fetchError) {
      try {
        handleFirestoreError(fetchError, OperationType.LIST, 'diveSites');
      } catch (wrappedError) {
        setError(wrappedError instanceof Error ? wrappedError.message : 'Failed to load dive sites.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery, cacheKey, filters.islandSearch, filters.siteSearch, hasFilter]);

  useEffect(() => {
    fetchPage('replace');
  }, [fetchPage]);

  return {
    sites,
    loading,
    loadingMore,
    hasMore,
    hasFilter,
    error,
    loadMore: () => fetchPage('append'),
  };
}
