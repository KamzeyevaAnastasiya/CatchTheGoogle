import { SamuraiNumberUtility } from "./samuraiNumberUtility.js"

describe("SamuraiNumberUtility", () => {
  const utility = new SamuraiNumberUtility()

  test("return an integer within range", () => {
    const from = 1
    const to = 5
    for (let i = 0; i < 100; i++) {
      const result = utility.getRandomInt(from, to)
      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThan(to)
      expect(Number.isInteger(result)).toBe(true)
    }
  })

  test("thows error if fromInclusive is equal toExclusive", () => {
    const from = 5
    const to = 5
    expect(() => utility.getRandomInt(from, to)).toThrow(Error)
  })

  test("thows error if fromInclusive is greater than toExclusive", () => {
    const from = 5
    const to = 3
    expect(() => utility.getRandomInt(from, to)).toThrow(Error)
  })

  test("return fromInclusive if toExclusive is just one more than fromInclusive", () => {
    const from = 5
    const to = 6
    expect(utility.getRandomInt(from, to)).toBe(from)
  })

  test("works with large rangee values", () => {
    const from = 1_000_000
    const to = 2_000_000
    const result = utility.getRandomInt(from, to)
    expect(result).toBeGreaterThanOrEqual(from)
    expect(result).toBeLessThan(to)
  })
})
