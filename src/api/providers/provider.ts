import type { Show } from '@/models/show.model'
import type { CastMember } from '@/models/cast.model'
import type { Episode } from '@/models/episode.model'

export interface ShowsProvider {
  getShows(page?: number): Promise<Show[]>
  getShowById(id: number): Promise<Show>
  searchShows(query: string): Promise<Show[]>
  getCast(showId: number): Promise<CastMember[]>
  getEpisodes(showId: number): Promise<Episode[]>
}

export type ProviderOptions = {
  baseUrl: string
}

export abstract class AbstractShowsProvider implements ShowsProvider {
  protected readonly baseUrl: string

  constructor(options: ProviderOptions) {
    this.baseUrl = options.baseUrl
  }

  protected async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  abstract getShows(page?: number): Promise<Show[]>
  abstract getShowById(id: number): Promise<Show>
  abstract searchShows(query: string): Promise<Show[]>
  abstract getCast(showId: number): Promise<CastMember[]>
  abstract getEpisodes(showId: number): Promise<Episode[]>
}
