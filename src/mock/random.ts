/**
 * Tiny seeded random number generator (mulberry32) so mock data is identical
 * on every page load and in every test run.
 */
export function createRandom(seed: number) {
  let state = seed

  function next(): number {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    integer(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min
    },
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(next() * items.length)]
    },
  }
}
