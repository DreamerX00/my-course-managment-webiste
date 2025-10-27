// Simple in-memory cache for API responses
// TTL-based caching without external dependencies

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private maxSize = 100; // Prevent memory leaks

  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    // Clean up if cache is too large
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Helper function to wrap queries with caching
export async function withCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute query
  const data = await queryFn();

  // Cache the result
  cache.set(key, data, ttlSeconds);

  return data;
}

// Periodically clean up expired entries (run every 5 minutes)
if (typeof window === "undefined") {
  // Server-side only
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}
