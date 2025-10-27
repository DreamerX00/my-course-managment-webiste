// Client-side cache hook for API requests
// Prevents duplicate fetches and provides in-memory caching

import { useState, useEffect, useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global cache store (persists across component mounts)
const cache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

interface UseCachedFetchOptions {
  cacheTime?: number; // Time in ms to keep data fresh (default: 5 minutes)
  staleTime?: number; // Time in ms before data becomes stale (default: 1 minute)
  enabled?: boolean; // Whether to fetch automatically
}

export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedFetchOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 60 * 1000, // 1 minute
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    // Check cache on mount
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // Check if already fetching
    if (pendingRequests.has(key)) {
      try {
        const result = await pendingRequests.get(key);
        setData(result as T);
        setIsLoading(false);
        return result as T;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    }

    // Check cache first
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (cached && now - cached.timestamp < cacheTime) {
      // Data is still fresh
      setData(cached.data);
      setIsLoading(false);
      return cached.data;
    }

    // If data is stale but exists, return it while fetching new data
    if (cached && now - cached.timestamp < staleTime) {
      setData(cached.data);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create and store the fetch promise
      const fetchPromise = fetcher();
      pendingRequests.set(key, fetchPromise);

      const result = await fetchPromise;

      // Update cache
      cache.set(key, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
      setIsLoading(false);
      pendingRequests.delete(key);

      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      pendingRequests.delete(key);
      throw err;
    }
  }, [key, fetcher, cacheTime, staleTime]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  const mutate = useCallback(
    async (newData?: T) => {
      if (newData) {
        // Update cache with new data
        cache.set(key, {
          data: newData,
          timestamp: Date.now(),
        });
        setData(newData);
      } else {
        // Refetch
        return fetchData();
      }
    },
    [key, fetchData]
  );

  const invalidate = useCallback(() => {
    cache.delete(key);
    pendingRequests.delete(key);
  }, [key]);

  return {
    data,
    isLoading,
    error,
    mutate,
    invalidate,
    refetch: fetchData,
  };
}

// Hook for fetching courses with built-in caching
export function useCourses(showAll = false) {
  return useCachedFetch(
    `courses-${showAll ? "all" : "published"}`,
    () =>
      fetch(`/api/courses${showAll ? "?all=true" : ""}`).then((r) => r.json()),
    { cacheTime: 5 * 60 * 1000 } // 5 minutes
  );
}

// Hook for fetching content settings with built-in caching
export function useContentSettings() {
  return useCachedFetch(
    "content-settings",
    () => fetch("/api/content-settings").then((r) => r.json()),
    { cacheTime: 60 * 60 * 1000 } // 1 hour
  );
}

// Clear all cache
export function clearCache() {
  cache.clear();
  pendingRequests.clear();
}
