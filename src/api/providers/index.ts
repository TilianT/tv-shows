import { TvMazeProvider } from '@/api/providers/tvMaze'

import type { ShowsProvider } from '@/api/providers/provider'

export enum ProviderTypeEnum {
  TvMaze = 'TvMaze',
}

const baseApiUrl = import.meta.env.VITE_BASE_API ?? 'https://api.tvmaze.com'
const providerType = import.meta.env.VITE_PROVIDER_TYPE as ProviderTypeEnum

export function getShowsProvider(): ShowsProvider {
  switch (providerType) {
    case ProviderTypeEnum.TvMaze:
      return new TvMazeProvider({ baseUrl: baseApiUrl })
    default:
      return new TvMazeProvider({ baseUrl: baseApiUrl })
  }
}
