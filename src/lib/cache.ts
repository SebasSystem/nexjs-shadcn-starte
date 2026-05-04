const store = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 minutos

export const cache = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (entry && Date.now() - entry.ts < TTL) {
      return entry.data as T;
    }
    if (entry) store.delete(key);
    return undefined;
  },

  set<T>(key: string, data: T): void {
    store.set(key, { data, ts: Date.now() });
  },

  has(key: string): boolean {
    return store.has(key) && Date.now() - store.get(key)!.ts < TTL;
  },

  invalidate(key: string): void {
    store.delete(key);
  },

  clear(): void {
    store.clear();
  },
};
