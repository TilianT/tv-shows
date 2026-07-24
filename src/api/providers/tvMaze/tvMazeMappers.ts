import stripText from '@/utils/stripText'

import type {
  TvMazeCastMember,
  TvMazeEpisode,
  TvMazeShow,
} from '@/api/providers/tvMaze/tvMaze.model'
import type { CastMember } from '@/models/cast.model'
import type { Episode } from '@/models/episode.model'
import type { Show } from '@/models/show.model'

import fallbackPosterUrl from '@/assets/images/fallback.png'

export function mapShow(show: TvMazeShow): Show {
  const network = show.network?.name ?? show.webChannel?.name ?? null

  return {
    description: show.summary ? stripText(show.summary) : null,
    genres: show.genres,
    id: show.id,
    image: {
      default: show.image?.medium ?? fallbackPosterUrl,
      original: show.image?.original ?? fallbackPosterUrl,
    },
    network,
    premiered: show.premiered,
    rating: show.rating?.average ?? null,
    status: show.status,
    title: show.name,
  }
}

export function mapEpisode(dto: TvMazeEpisode): Episode {
  return {
    description: dto.summary ? stripText(dto.summary) : null,
    id: dto.id,
    name: dto.name,
    number: dto.number ?? null,
    season: dto.season ?? null,
  }
}

export function mapCastMember(dto: TvMazeCastMember): CastMember {
  return {
    characterName: dto.character.name || '',
    id: dto.person.id,
    image: dto.person.image?.medium ?? fallbackPosterUrl,
    name: dto.person.name,
  }
}

export default {
  mapCastMember,
  mapEpisode,
  mapShow,
}
