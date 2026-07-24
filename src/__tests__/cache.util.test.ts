import { beforeEach, describe, expect, it, vi } from 'vitest'

import { readCache, writeCache } from '@/utils/cache'

describe('Cache util', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('writeCache then readCache returns data when not expired', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)

    writeCache('k', { a: 1 })

    vi.spyOn(Date, 'now').mockReturnValue(1_500)
    expect(readCache<{ a: number }>('k', 1_000)).toEqual({ a: 1 })
  })

  it('readCache returns null when missing', () => {
    expect(readCache('missing', 1_000)).toBeNull()
  })

  it('readCache returns null when expired', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    writeCache('k', 'data')

    vi.spyOn(Date, 'now').mockReturnValue(3_001)
    expect(readCache<string>('k', 2_000)).toBeNull()
  })
})
