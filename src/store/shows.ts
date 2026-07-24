import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getCastByShowId, getEpisodesByShowId, getList, getShowById } from '@/api'
import { readCache, writeCache } from '@/utils/cache'

import {
  FAVOURITES_CACHE_KEY,
  RECENTLY_VIEWED_CACHE_KEY,
  RECENTLY_VIEWED_LIMIT,
  SHOWS_LIST_CACHE_KEY,
  SHOWS_LIST_TTL_MS,
} from './shows.config'
import { buildGenreMap, appendToGenreMap } from './shows.helpers'

import type { Show } from '@/models/show.model'
import type { CastMember } from '@/models/cast.model'
import type { Episode } from '@/models/episode.model'

interface ShowsCache {
  page: number
  shows: Show[]
}

export const useShowsStore = defineStore('shows', () => {
  const allShows = ref<Show[]>([])
  const error = ref<string | null>(null)
  const favouritesShowList = ref(new Map<number, Show>())
  const genreMap = ref(new Map<string, Show[]>())
  const hasMore = ref(true)
  const isLoading = ref(false)
  const isLoadingNextPage = ref(false)
  const page = ref(-1)
  const recentlyViewedShowList = ref<Show[]>([])

  const genreList = computed(() => Array.from(genreMap.value.keys()) ?? [])
  function getShowsByGenre(genre: string): Show[] {
    return genreMap.value.get(genre.toLocaleLowerCase()) ?? []
  }

  // Caches for show details, cast, and episodes to avoid redundant API calls.
  const detailsCache = ref(new Map<number, Show>())
  const castCache = ref(new Map<number, CastMember[]>())
  const episodesCache = ref(new Map<number, Episode[]>())

  function restoreCache(): void {
    const cached = readCache<ShowsCache>(SHOWS_LIST_CACHE_KEY, SHOWS_LIST_TTL_MS)

    if (cached && cached.shows.length > 0) {
      allShows.value = cached.shows
      genreMap.value = buildGenreMap(cached.shows)
      page.value = cached.page
    }
  }

  async function loadPage(nextPage: number): Promise<void> {
    if (isLoadingNextPage.value) return

    isLoadingNextPage.value = true
    error.value = null

    try {
      const data = await getList(nextPage)

      if (!data || data.length === 0) {
        hasMore.value = false
        return
      }

      if (genreMap.value.size === 0) {
        genreMap.value = buildGenreMap(data)
      } else {
        appendToGenreMap(data, genreMap.value)
      }

      allShows.value = [...allShows.value, ...data]
      page.value = nextPage

      writeCache(SHOWS_LIST_CACHE_KEY, { page: page.value, shows: allShows.value })
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoadingNextPage.value = false
    }
  }

  async function loadMoreShows(): Promise<void> {
    if (!hasMore.value) return
    await loadPage(page.value + 1)
  }

  async function getShowDetails(id: number): Promise<Show | null> {
    const cached = detailsCache.value.get(id)
    if (cached) return cached

    isLoading.value = true
    error.value = null

    try {
      const show = await getShowById(id)
      detailsCache.value.set(id, show)

      return show
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)

      return null
    } finally {
      isLoading.value = false
    }
  }

  async function getShowCast(id: number): Promise<CastMember[]> {
    const cached = castCache.value.get(id)
    if (cached) return cached

    isLoading.value = true
    error.value = null

    try {
      const rawCast = await getCastByShowId(id)
      const seen = new Set<number>()
      const uniqueCast: CastMember[] = []

      // Limit to 10 unique cast members for simplicity
      for (const member of rawCast) {
        if (seen.has(member.id)) continue
        seen.add(member.id)
        uniqueCast.push(member)

        if (uniqueCast.length >= 10) break
      }

      castCache.value.set(id, uniqueCast)

      return uniqueCast
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)

      return []
    } finally {
      isLoading.value = false
    }
  }

  async function getShowEpisodes(id: number): Promise<Episode[]> {
    const cached = episodesCache.value.get(id)
    if (cached) return cached

    isLoading.value = true
    error.value = null

    try {
      const episodes = await getEpisodesByShowId(id)
      episodesCache.value.set(id, episodes)

      return episodes
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)

      return []
    } finally {
      isLoading.value = false
    }
  }

  function isShowInFavourites(id: number): boolean {
    return favouritesShowList.value.has(id)
  }

  function updateFavourites(): void {
    writeCache(FAVOURITES_CACHE_KEY, Array.from(favouritesShowList.value.values()))
  }

  function initFavourites(): void {
    const storedFavourites = readCache<Show[]>(FAVOURITES_CACHE_KEY, Number.POSITIVE_INFINITY)

    if (Array.isArray(storedFavourites) && storedFavourites.length > 0) {
      for (const show of storedFavourites) {
        favouritesShowList.value.set(show.id, show)
        detailsCache.value.set(show.id, show)
      }
    }
  }

  function initRecentlyViewed(): void {
    const storedRecentlyViewed = readCache<Show[]>(
      RECENTLY_VIEWED_CACHE_KEY,
      Number.POSITIVE_INFINITY,
    )

    if (Array.isArray(storedRecentlyViewed) && storedRecentlyViewed.length > 0) {
      recentlyViewedShowList.value = storedRecentlyViewed.slice(0, RECENTLY_VIEWED_LIMIT)
      for (const show of recentlyViewedShowList.value) {
        detailsCache.value.set(show.id, show)
      }
    }
  }

  async function toggleShowToFavourites(id: number): Promise<void> {
    if (favouritesShowList.value.has(id)) {
      favouritesShowList.value.delete(id)
      updateFavourites()
    } else {
      const show = await getShowDetails(id)

      if (show) {
        favouritesShowList.value.set(id, show)
        updateFavourites()
      }
    }
  }

  function recordRecentlyViewed(show: Show): void {
    const next = [show, ...recentlyViewedShowList.value.filter((s) => s.id !== show.id)].slice(
      0,
      RECENTLY_VIEWED_LIMIT,
    )

    recentlyViewedShowList.value = next
    detailsCache.value.set(show.id, show)
    writeCache(RECENTLY_VIEWED_CACHE_KEY, recentlyViewedShowList.value)
  }

  restoreCache()
  initFavourites()
  initRecentlyViewed()

  return {
    error,
    favouritesShowList: computed(() => Array.from(favouritesShowList.value.values()) ?? []),
    genreList,
    genreMap,
    getShowCast,
    getShowDetails,
    getShowEpisodes,
    getShowsByGenre,
    hasMore,
    isLoading,
    isLoadingNextPage,
    isShowInFavourites,
    loadMoreShows,
    page,
    recentlyViewedShowList,
    recordRecentlyViewed,
    toggleShowToFavourites,
  }
})
