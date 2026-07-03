// In-memory cache for AI-generated text, keyed by entity id + a hash of the
// underlying data. When the data changes (score, events, standings), the hash
// changes and the next request regenerates — otherwise we serve the cached
// copy instead of calling the model on every page load.
interface CacheEntry {
  dataHash: string;
  text: string;
  generatedAt: number;
}

const store = new Map<string, CacheEntry>();

export function hashData(data: unknown): string {
  return JSON.stringify(data);
}

export function getCached(key: string, dataHash: string): string | null {
  const entry = store.get(key);
  if (!entry || entry.dataHash !== dataHash) return null;
  return entry.text;
}

export function setCached(key: string, dataHash: string, text: string): void {
  store.set(key, { dataHash, text, generatedAt: Date.now() });
}
