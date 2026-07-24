import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { Show } from '@/models/show.model'

vi.mock('@/api', () => ({
  getListByQuery: vi.fn(),
}))

import { getListByQuery } from '@/api'
import { useShowsSearchStore } from '@/store/shows.search'

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

describe('shows.search store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('Clears results for empty query and does not call API', async () => {
    const store = useShowsSearchStore()
    const api = vi.mocked(getListByQuery)

    await store.findShowsByQuery('   ')

    expect(api).not.toHaveBeenCalled()
    expect(store.searchList).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('Trims query, calls API, and sorts by rating desc', async () => {
    const store = useShowsSearchStore()
    const api = vi.mocked(getListByQuery)

    api.mockResolvedValue([
      makeShow({ id: 1, rating: 7.0 }),
      makeShow({ id: 2, rating: 9.0 }),
      makeShow({ id: 3, rating: null }),
    ])

    await store.findShowsByQuery('  hello  ')

    expect(api).toHaveBeenCalledWith('hello')
    expect(store.searchList.map((s) => s.id)).toEqual([2, 1, 3])
    expect(store.error).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  it('Sets error and clears list on API failure', async () => {
    const store = useShowsSearchStore()
    const api = vi.mocked(getListByQuery)

    api.mockRejectedValue(new Error('boom'))

    await store.findShowsByQuery('x')

    expect(store.searchList).toEqual([])
    expect(store.error).toBe('boom')
    expect(store.isLoading).toBe(false)
  })
})
