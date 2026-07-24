type CacheEntry<T> = {
  ts: number
  data: T
}

export function readCache<T>(key: string, ttlMs: number): T | null {
  const raw = localStorage.getItem(key)

  if (!raw) return null

  const parsed = JSON.parse(raw) as CacheEntry<T>
  const isExpired = Date.now() - parsed.ts > ttlMs

  if (isExpired) return null

  return parsed.data
}

export function writeCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { ts: Date.now(), data }
  localStorage.setItem(key, JSON.stringify(entry))
}
