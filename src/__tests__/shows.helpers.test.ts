import { describe, expect, it } from 'vitest'

import type { Show } from '@/models/show.model'
import { buildGenreMap, sortShowsByRating, appendToGenreMap } from '@/store/shows.helpers'

function makeShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    title: 'Show',
    description: null,
    genres: [],
    image: { default: null, original: null },
    rating: null,
    ...overrides,
  }
}

describe('shows.helpers', () => {
  it('sortShowsByRating sorts descending, null/undefined treated as 0', () => {
    const list = [
      makeShow({ id: 1, rating: 7.2 }),
      makeShow({ id: 2, rating: null }),
      makeShow({ id: 3 }),
      makeShow({ id: 4, rating: 9.1 }),
    ]

    const sorted = sortShowsByRating(list)

    expect(sorted.map((s) => s.id)).toEqual([4, 1, 2, 3])
  })

  it('buildGenreMap buckets genres case-insensitively and sorts each bucket by rating', () => {
    const a = makeShow({ id: 1, title: 'A', genres: ['Drama', 'Sci-Fi'], rating: 7.2 })
    const b = makeShow({ id: 2, title: 'B', genres: ['drama'], rating: 9.1 })
    const c = makeShow({ id: 3, title: 'C', genres: ['Sci-Fi'], rating: 8.0 })

    const map = buildGenreMap([a, b, c])

    expect(Array.from(map.keys()).sort()).toEqual(['drama', 'sci-fi'])

    const drama = map.get('drama')
    expect(drama?.map((s) => s.id)).toEqual([2, 1])

    const scifi = map.get('sci-fi')
    expect(scifi?.map((s) => s.id)).toEqual([3, 1])
  })

  it('appendToGenreMap appends shows into existing genre buckets', () => {
    const map = buildGenreMap([makeShow({ id: 1, genres: ['Drama'], rating: 8 })])
    appendToGenreMap([makeShow({ id: 2, genres: ['Drama', 'Comedy'], rating: 7 })], map)

    expect(map.get('drama')?.map((s) => s.id)).toEqual([1, 2])
    expect(map.get('comedy')?.map((s) => s.id)).toEqual([2])
  })
})
