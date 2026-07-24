import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { CastMember } from '@/models/cast.model'
import type { Episode } from '@/models/episode.model'
import type { Show } from '@/models/show.model'

import {
  FAVOURITES_CACHE_KEY,
  RECENTLY_VIEWED_CACHE_KEY,
  SHOWS_LIST_CACHE_KEY,
  SHOWS_LIST_TTL_MS,
} from '@/store/shows.config'

vi.mock('@/api', () => ({
  getCastByShowId: vi.fn(),
  getEpisodesByShowId: vi.fn(),
  getList: vi.fn(),
  getShowById: vi.fn(),
}))

vi.mock('@/utils/cache', () => ({
  readCache: vi.fn(),
  writeCache: vi.fn(),
}))

import { getCastByShowId, getEpisodesByShowId, getList, getShowById } from '@/api'
import { readCache, writeCache } from '@/utils/cache'
import { useShowsStore } from '@/store/shows'

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

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  vi.mocked(readCache).mockReturnValue(null)
  vi.mocked(getList).mockResolvedValue([])
})

describe('restoreCache', () => {
  it('Leaves store empty when no cache exists', () => {
    const store = useShowsStore()
    expect(store.genreMap.size).toBe(0)
    expect(store.page).toBe(-1)
  })

  it('Restores genreMap sorted by rating and sets page', () => {
    vi.mocked(readCache).mockImplementation((key) =>
      key === SHOWS_LIST_CACHE_KEY
        ? {
            page: 3,
            shows: [
              makeShow({ id: 1, genres: ['Drama'], rating: 7 }),
              makeShow({ id: 2, genres: ['Drama'], rating: 9 }),
            ],
          }
        : null,
    )
    const store = useShowsStore()

    expect(store.page).toBe(3)
    expect(store.genreMap.get('drama')?.map((s) => s.id)).toEqual([2, 1])
    expect(vi.mocked(readCache)).toHaveBeenCalledWith(SHOWS_LIST_CACHE_KEY, SHOWS_LIST_TTL_MS)
    expect(vi.mocked(getList)).not.toHaveBeenCalled()
  })
})

describe('loadMoreShows', () => {
  it('Fetches page 0 first and builds sorted genreMap', async () => {
    vi.mocked(getList).mockResolvedValue([
      makeShow({ id: 1, genres: ['Drama'], rating: 7 }),
      makeShow({ id: 2, genres: ['Drama'], rating: 9 }),
    ])
    const store = useShowsStore()

    await store.loadMoreShows()

    expect(vi.mocked(getList)).toHaveBeenCalledWith(0)
    expect(store.genreMap.get('drama')?.map((s) => s.id)).toEqual([2, 1])
  })

  it('Appends subsequent pages without re-sorting', async () => {
    vi.mocked(getList)
      .mockResolvedValueOnce([makeShow({ id: 1, genres: ['Drama'], rating: 9 })])
      .mockResolvedValueOnce([makeShow({ id: 2, genres: ['Drama'], rating: 5 })])
    const store = useShowsStore()

    await store.loadMoreShows()
    await store.loadMoreShows()

    expect(store.genreMap.get('drama')?.map((s) => s.id)).toEqual([1, 2])
  })

  it('Writes { page, shows } cache after each fetch', async () => {
    const show = makeShow({ id: 1, genres: ['Drama'] })
    vi.mocked(getList).mockResolvedValue([show])
    const store = useShowsStore()

    await store.loadMoreShows()

    expect(vi.mocked(writeCache)).toHaveBeenCalledWith(SHOWS_LIST_CACHE_KEY, {
      page: 0,
      shows: [show],
    })
  })

  it('Sets hasMore to false and skips cache write when API returns empty', async () => {
    const store = useShowsStore()

    await store.loadMoreShows()

    expect(store.hasMore).toBe(false)
    expect(vi.mocked(writeCache)).not.toHaveBeenCalledWith(SHOWS_LIST_CACHE_KEY, expect.anything())
  })

  it('Prevents concurrent fetches', async () => {
    let resolve!: (v: Show[]) => void
    vi.mocked(getList).mockReturnValue(new Promise((r) => (resolve = r)))
    const store = useShowsStore()

    const first = store.loadMoreShows()
    const second = store.loadMoreShows()
    resolve([makeShow({ id: 1, genres: ['Drama'] })])
    await Promise.all([first, second])

    expect(vi.mocked(getList)).toHaveBeenCalledTimes(1)
  })
})

describe('getShowDetails', () => {
  it('Fetches show and caches it', async () => {
    vi.mocked(getShowById).mockResolvedValue(makeShow({ id: 10, title: 'X' }))
    const store = useShowsStore()

    const show = await store.getShowDetails(10)
    await store.getShowDetails(10) // second call

    expect(show?.title).toBe('X')
    expect(vi.mocked(getShowById)).toHaveBeenCalledTimes(1)
  })

  it('Returns null and sets error on failure', async () => {
    vi.mocked(getShowById).mockRejectedValue(new Error('not found'))
    const store = useShowsStore()

    expect(await store.getShowDetails(99)).toBeNull()
    expect(store.error).toBe('not found')
  })
})

describe('getShowCast', () => {
  it('De-dupes by id, limits to 10, and caches', async () => {
    const raw: CastMember[] = [
      { id: 1, name: 'A', image: null },
      { id: 1, name: 'A', image: null }, // duplicate
      ...Array.from({ length: 20 }, (_, i) => ({ id: i + 2, name: `A${i}`, image: null })),
    ]
    vi.mocked(getCastByShowId).mockResolvedValue(raw)
    const store = useShowsStore()

    const cast = await store.getShowCast(5)
    await store.getShowCast(5)

    expect(cast).toHaveLength(10)
    expect(cast[0]!.id).toBe(1)
    expect(vi.mocked(getCastByShowId)).toHaveBeenCalledTimes(1)
  })
})

describe('getShowEpisodes', () => {
  it('Returns episodes and caches them', async () => {
    const eps: Episode[] = [
      { id: 1, name: 'Ep1', description: null },
      { id: 2, name: 'Ep2', description: null },
    ]
    vi.mocked(getEpisodesByShowId).mockResolvedValue(eps)
    const store = useShowsStore()

    const result = await store.getShowEpisodes(99)
    await store.getShowEpisodes(99)

    expect(result.map((e) => e.id)).toEqual([1, 2])
    expect(vi.mocked(getEpisodesByShowId)).toHaveBeenCalledTimes(1)
  })
})

describe('toggleShowToFavourites', () => {
  it('Adds then removes, persisting each change', async () => {
    vi.mocked(getShowById).mockResolvedValue(makeShow({ id: 5 }))
    const store = useShowsStore()

    await store.toggleShowToFavourites(5)
    expect(store.isShowInFavourites(5)).toBe(true)
    expect(vi.mocked(writeCache)).toHaveBeenCalledWith(FAVOURITES_CACHE_KEY, expect.any(Array))

    await store.toggleShowToFavourites(5)
    expect(store.isShowInFavourites(5)).toBe(false)
  })

  it('Restores favourites from cache on init', () => {
    vi.mocked(readCache).mockImplementation((key) =>
      key === FAVOURITES_CACHE_KEY ? [makeShow({ id: 7 })] : null,
    )
    const store = useShowsStore()

    expect(store.isShowInFavourites(7)).toBe(true)
  })
})

describe('recordRecentlyViewed', () => {
  it('Prepends and de-dupes — re-visiting moves show to front', () => {
    const store = useShowsStore()
    store.recordRecentlyViewed(makeShow({ id: 1 }))
    store.recordRecentlyViewed(makeShow({ id: 2 }))
    store.recordRecentlyViewed(makeShow({ id: 1 }))

    expect(store.recentlyViewedShowList.map((s) => s.id)).toEqual([1, 2])
    expect(vi.mocked(writeCache)).toHaveBeenCalledWith(RECENTLY_VIEWED_CACHE_KEY, expect.any(Array))
  })

  it('Restores recently viewed from cache on init', () => {
    vi.mocked(readCache).mockImplementation((key) =>
      key === RECENTLY_VIEWED_CACHE_KEY ? [makeShow({ id: 3 })] : null,
    )
    const store = useShowsStore()

    expect(store.recentlyViewedShowList[0]!.id).toBe(3)
  })
})
