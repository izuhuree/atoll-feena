import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Atoll, DiveSite } from '../types';

/**
 * Page size for the underlying Firestore query.
 *
 * NOTE: We deliberately fetch a larger window than we render so that the
 * client-side case-insensitive `includes` filter has enough rows to find
 * matches. Server-side `startAt/endAt` prefix queries were removed because
 * they were case-sensitive and silently returned 0 results for valid
 * lowercase / mid-word searches.
 */
const PAGE_SIZE = 60;

interface DiveSiteFilters {
  atoll: Atoll | 'All';
  islandSearch: string;
  siteSearch: string;
}

const normalize = (value: string | undefined | null) =>
  (value || '').toString().toLowerCase().trim();

const matchesText = (value: string | undefined, queryText: string) => {
  const q = normalize(queryText);
  if (!q) return true;
  return normalize(value).includes(q);
};

export function useFilteredDiveSites(filters: DiveSiteFilters) {
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const rawSitesRef = useRef<DiveSite[]>([]);
  const cacheRef = useRef(
    new Map<
      string,
      {
        raw: DiveSite[];
        cursor: QueryDocumentSnapshot<DocumentData> | null;
        hasMore: boolean;
      }
    >()
  );

  const islandTerm = filters.islandSearch.trim();
  const siteTerm = filters.siteSearch.trim();

  const hasFilter =
    filters.atoll !== 'All' ||
    islandTerm.length >= 2 ||
    siteTerm.length >= 2;

  const cacheKey = useMemo(
    () =>
      JSON.stringify({
        atoll: filters.atoll,
        island: islandTerm.toLowerCase(),
        site: siteTerm.toLowerCase(),
      }),
    [filters.atoll, islandTerm, siteTerm]
  );

  /**
   * Build a Firestore query that is permissive enough to allow accurate
   * client-side case-insensitive filtering. We only constrain by atoll on
   * the server; text matching happens after the fetch.
   */
  const buildQuery = useCallback(
    (cursor?: QueryDocumentSnapshot<DocumentData> | null) => {
      if (!db) return null;
      const constraints = [];
      if (filters.atoll !== 'All') {
        constraints.push(where('atoll', '==', filters.atoll));
      }
      constraints.push(orderBy('name'));
      if (cursor) constraints.push(startAfter(cursor));
      constraints.push(limit(PAGE_SIZE));
      return query(collection(db, 'diveSites'), ...constraints);
    },
    [filters.atoll]
  );

  const applyClientFilters = useCallback(
    (rows: DiveSite[]) =>
      rows
        .filter((site) => matchesText(site.islandBase, islandTerm))
        .filter((site) => matchesText(site.name, siteTerm))
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [islandTerm, siteTerm]
  );

  const fetchPage = useCallback(
    async (mode: 'replace' | 'append') => {
      if (!hasFilter || !db) {
        setSites([]);
        rawSitesRef.current = [];
        setHasMore(false);
        cursorRef.current = null;
        setError(null);
        return;
      }

      // Serve from cache (only for replace; append always goes to network).
      const cached = mode === 'replace' ? cacheRef.current.get(cacheKey) : null;
      if (cached) {
        rawSitesRef.current = cached.raw;
        cursorRef.current = cached.cursor;
        setHasMore(cached.hasMore);
        setSites(applyClientFilters(cached.raw));
        return;
      }

      const q = buildQuery(mode === 'append' ? cursorRef.current : null);
      if (!q) return;
      if (mode === 'append') setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const snapshot = await getDocs(q);
        const page = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as DiveSite)
        );
        const nextRaw =
          mode === 'append' ? [...rawSitesRef.current, ...page] : page;
        const nextCursor = snapshot.docs[snapshot.docs.length - 1] ?? null;
        const nextHasMore = snapshot.docs.length === PAGE_SIZE;

        rawSitesRef.current = nextRaw;
        cursorRef.current = nextCursor;
        setHasMore(nextHasMore);
        setSites(applyClientFilters(nextRaw));
        cacheRef.current.set(cacheKey, {
          raw: nextRaw,
          cursor: nextCursor,
          hasMore: nextHasMore,
        });
      } catch (fetchError) {
        try {
          handleFirestoreError(
            fetchError,
            OperationType.LIST,
            'diveSites'
          );
        } catch (wrappedError) {
          setError(
            wrappedError instanceof Error
              ? wrappedError.message
              : 'Failed to load dive sites.'
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [applyClientFilters, buildQuery, cacheKey, hasFilter]
  );

  // Reload when filter scope (atoll) changes — that's the only filter that
  // changes the Firestore query. Text filters are applied client-side so we
  // just re-derive `sites` from the raw cache without a network round-trip.
  useEffect(() => {
    fetchPage('replace');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.atoll, hasFilter]);

  // Re-derive visible list when text filters change, using whatever raw
  // rows we have already loaded for the current atoll scope.
  useEffect(() => {
    if (!hasFilter) {
      setSites([]);
      return;
    }
    setSites(applyClientFilters(rawSitesRef.current));
  }, [applyClientFilters, hasFilter]);

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
