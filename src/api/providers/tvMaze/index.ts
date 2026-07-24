import { mapCastMember, mapEpisode, mapShow } from '@/api/providers/tvMaze/tvMazeMappers'

import type {
  TvMazeCastMember,
  TvMazeEpisode,
  TvMazeShow,
} from '@/api/providers/tvMaze/tvMaze.model'

import { AbstractShowsProvider } from '@/api/providers/provider'

export class TvMazeProvider extends AbstractShowsProvider {
  async getShows(page = 0) {
    const res = await fetch(`${this.baseUrl}/shows?page=${page}`)

    // TVMaze returns 404 when page is beyond end
    if (res.status === 404) return []

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as TvMazeShow[]
    return data.map(mapShow)
  }

  async getShowById(id: number) {
    const data = await this.fetchJson<TvMazeShow>(`${this.baseUrl}/shows/${id}`)
    return mapShow(data)
  }

  async searchShows(query: string) {
    const q = encodeURIComponent(query)
    // NOTE: /search/shows returns [{ score, show: TvMazeShow }]
    type SearchResp = {
      score: number
      show: TvMazeShow
    }[]
    const data = await this.fetchJson<SearchResp>(`${this.baseUrl}/search/shows?q=${q}`)
    return data.map((item) => mapShow(item.show))
  }

  async getCast(showId: number) {
    const data = await this.fetchJson<TvMazeCastMember[]>(`${this.baseUrl}/shows/${showId}/cast`)
    return data.map(mapCastMember)
  }

  async getEpisodes(showId: number) {
    const data = await this.fetchJson<TvMazeEpisode[]>(`${this.baseUrl}/shows/${showId}/episodes`)
    return data.map(mapEpisode)
  }
}
