import type { Show } from '@/models/show.model'

export function sortShowsByRating(list: Show[]): Show[] {
  return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
}

export function buildGenreMap(list: Show[]): Map<string, Show[]> {
  const map = new Map<string, Show[]>()

  for (const show of list) {
    for (const genre of show.genres) {
      const key = genre.toLocaleLowerCase()
      const bucket = map.get(key)
      if (bucket) bucket.push(show)
      else map.set(key, [show])
    }
  }

  for (const bucket of map.values()) {
    sortShowsByRating(bucket)
  }

  return map
}

export function appendToGenreMap(list: Show[], map: Map<string, Show[]>): void {
  for (const show of list) {
    for (const genre of show.genres) {
      const key = genre.toLocaleLowerCase()
      const bucket = map.get(key)
      if (bucket) bucket.push(show)
      else map.set(key, [show])
    }
  }
}
