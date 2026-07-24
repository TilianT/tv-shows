export type Show = {
  description: string | null
  genres: string[]
  id: number
  image: {
    default: string | null
    original: string | null
  }
  network?: string | null
  premiered?: string | null
  rating?: number | null
  status?: string
  title: string
}
