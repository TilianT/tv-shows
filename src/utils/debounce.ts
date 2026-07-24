type Debounced<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void
}

export default function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs = 500,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = ((...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), waitMs)
  }) as Debounced<Args>

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  return debounced
}
