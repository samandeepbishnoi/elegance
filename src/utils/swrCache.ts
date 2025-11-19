/**
 * Stale-While-Revalidate Cache Utility
 * 
 * Implements a SWR pattern for API requests:
 * 1. Returns cached data immediately (if available)
 * 2. Fetches fresh data in the background
 * 3. Updates cache and notifies subscribers
 * 
 * Benefits:
 * - Instant UI updates with cached data
 * - Always fresh data after revalidation
 * - Reduced perceived loading time
 * - Automatic deduplication of requests
 */

import { useState, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isValidating: boolean;
}

interface SwrOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number; // Time in ms to deduplicate requests
  cacheTime?: number; // Time in ms before cache is considered stale
}

type Subscriber = () => void;

class SwrCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  private defaultOptions: SwrOptions = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000, // 2 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  };

  constructor() {
    // Setup focus and reconnect listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.revalidateOnFocus());
      window.addEventListener('online', () => this.revalidateOnReconnect());
    }
  }

  /**
   * Main SWR fetch function
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SwrOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    const cached = this.cache.get(key);
    const now = Date.now();

    // Check if we have a pending request for this key (deduplication)
    const pending = this.pendingRequests.get(key);
    if (pending && cached && now - cached.timestamp < opts.dedupingInterval!) {
      return pending;
    }

    // Return cached data immediately if available
    if (cached && now - cached.timestamp < opts.cacheTime!) {
      // Trigger background revalidation if cache is getting old (>50% of cache time)
      if (!cached.isValidating && now - cached.timestamp > opts.cacheTime! * 0.5) {
        this.revalidate(key, fetcher, opts);
      }
      return cached.data;
    }

    // No cache or cache expired - fetch fresh data
    return this.revalidate(key, fetcher, opts);
  }

  /**
   * Revalidate data in background
   */
  private async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    _options: SwrOptions
  ): Promise<T> {
    const cached = this.cache.get(key);

    // Mark as validating
    if (cached) {
      cached.isValidating = true;
    }

    // Create fetch promise
    const fetchPromise = fetcher()
      .then((data) => {
        // Update cache
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          isValidating: false,
        });

        // Notify subscribers
        this.notify(key);

        // Clean up pending request
        this.pendingRequests.delete(key);

        return data;
      })
      .catch((error) => {
        // On error, remove validating flag but keep stale data
        if (cached) {
          cached.isValidating = false;
        }
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store pending request for deduplication
    this.pendingRequests.set(key, fetchPromise);

    return fetchPromise;
  }

  /**
   * Get cached data without fetching
   */
  get<T>(key: string): T | undefined {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  /**
   * Check if data is currently being revalidated
   */
  isValidating(key: string): boolean {
    const cached = this.cache.get(key);
    return cached?.isValidating || false;
  }

  /**
   * Manually invalidate cache for a key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.notify(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    // Notify all subscribers
    this.subscribers.forEach((subs) => {
      subs.forEach((cb) => cb());
    });
  }

  /**
   * Subscribe to cache updates for a key
   */
  subscribe(key: string, callback: Subscriber): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Manually set cache data
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isValidating: false,
    });
    this.notify(key);
  }

  /**
   * Notify all subscribers for a key
   */
  notify(key: string): void {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach((cb) => cb());
    }
  }

  /**
   * Revalidate all cache on window focus
   */
  private revalidateOnFocus(): void {
    // Revalidate caches that are older than 1 minute
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > 60000 && !entry.isValidating) {
        // Trigger revalidation via subscribers
        this.notify(key);
      }
    });
  }

  /**
   * Revalidate all cache on reconnect
   */
  private revalidateOnReconnect(): void {
    // Revalidate all cache when back online
    this.cache.forEach((_, key) => {
      this.notify(key);
    });
  }
}

// Export singleton instance
export const swrCache = new SwrCache();

/**
 * React hook for SWR
 */
export function useSWR<T>(
  key: string | null,
  fetcher: (() => Promise<T>) | null,
  options?: SwrOptions
) {
  const [data, setData] = useState<T | undefined>(() => {
    if (key) return swrCache.get<T>(key);
    return undefined;
  });
  const [error, setError] = useState<Error | undefined>();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!key || !fetcher) return;

    let cancelled = false;

    // Subscribe to cache updates
    const unsubscribe = swrCache.subscribe(key, () => {
      if (!cancelled) {
        const cachedData = swrCache.get<T>(key);
        if (cachedData !== undefined) {
          setData(cachedData);
        }
        setIsValidating(swrCache.isValidating(key));
      }
    });

    // Fetch data
    const fetchData = async () => {
      try {
        setIsValidating(true);
        const result = await swrCache.fetch(key, fetcher, options);
        if (!cancelled) {
          setData(result);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setIsValidating(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [key, fetcher, options]);

  return {
    data,
    error,
    isValidating,
    mutate: (newData: T) => {
      if (key) {
        swrCache.set(key, newData);
      }
    },
  };
}

// Export for direct use
export { SwrCache };

// Helper function to create cache keys
export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};
