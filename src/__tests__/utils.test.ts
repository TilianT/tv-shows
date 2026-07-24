import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

import stripText from '@/utils/stripText'
import debounce from '@/utils/debounce'
import isMobileDevice from '@/utils/isMobileDevice'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('stripText', () => {
  it('Removes HTML tags and trims', () => {
    expect(stripText('  <p>Hello <b>World</b></p>  ')).toBe('Hello World')
  })
})

describe('isMobileDevice', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(),
    })
  })

  it('Returns true when viewport matches mobile media query', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
    expect(isMobileDevice()).toBe(true)
  })

  it('Returns false when viewport does not match mobile media query', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)
    expect(isMobileDevice()).toBe(false)
  })
})

describe('debounce', () => {
  it('Calls the function once with last args after wait', () => {
    vi.useFakeTimers()

    const fn = vi.fn()
    const d = debounce(fn, 50)

    d(1)
    d(2)
    d(3)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(49)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(3)

    vi.useRealTimers()
  })

  it('Cancel prevents pending call', () => {
    vi.useFakeTimers()

    const fn = vi.fn()
    const d = debounce(fn, 50)

    d('x')
    d.cancel()

    vi.advanceTimersByTime(60)
    expect(fn).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
