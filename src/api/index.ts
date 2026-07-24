import type { Show } from '@/models/show.model'
import type { CastMember } from '@/models/cast.model'
import type { Episode } from '@/models/episode.model'

import { getShowsProvider } from '@/api/providers'

const provider = getShowsProvider()

/**
 * Gets the list of the shows from the API.
 *
 * @returns {Promise<Show[]>} - Response promise of the shows list
 * @throws {Error} - Throws an error if the fetch operation fails
 */
const getList = async (page = 0): Promise<Show[]> => {
  return provider.getShows(page)
}

/**
 * Gets the details of the show by ID
 *
 * @returns {Promise<Show>} - Response promise of the show details
 * @throws {Error} - Throws an error if the fetch operation fails
 */
const getShowById = async (id: number): Promise<Show> => {
  return provider.getShowById(id)
}

/**
 * Gets the list of the shows by the query
 *
 * @returns {Promise<Show[]>} - Response promise of the shows list
 * @throws {Error} - Throws an error if the fetch operation fails
 */
const getListByQuery = async (query: string): Promise<Show[]> => {
  return provider.searchShows(query)
}

/**
 * Gets the cast of the show by ID
 *
 * @returns {Promise<CastMember[]>} - Response promise of the cast list
 * @throws {Error} - Throws an error if the fetch operation fails
 */
const getCastByShowId = async (id: number): Promise<CastMember[]> => {
  return provider.getCast(id)
}

/**
 * Gets the episodes of the show by ID
 *
 * @returns {Promise<Episode[]>} - Response promise of the episodes list
 * @throws {Error} - Throws an error if the fetch operation fails
 */
const getEpisodesByShowId = async (id: number): Promise<Episode[]> => {
  return provider.getEpisodes(id)
}

export { getList, getShowById, getListByQuery, getCastByShowId, getEpisodesByShowId }
