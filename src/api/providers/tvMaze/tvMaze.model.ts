/**
 * TVMaze DTOs.
 *
 * Only include fields that are actually in use.
 */

// --- Show DTO ---
export type TvMazeShow = {
  genres: string[]
  id: number
  image: { medium: string; original?: string } | null
  name: string
  network?: { name: string } | null
  premiered?: string | null
  rating: { average: number | null }
  status: string
  summary: string | null
  webChannel?: { name: string } | null
}

// --- Cast DTO ---
export type TvMazeCastMember = {
  person: {
    id: number
    name: string
    image?: { medium: string; original?: string } | null
  }
  character: {
    id: number
    name: string
    image?: { medium: string; original?: string } | null
  }
}

// --- Episode DTO ---
export type TvMazeEpisode = {
  id: number
  name: string
  season: number | null
  number: number | null
  summary: string | null
}
