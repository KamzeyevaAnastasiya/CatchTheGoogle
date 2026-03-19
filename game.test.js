import { Game } from "./game.js"
import { GameStatuses } from "./gameStatuses.js"

describe("Game test", () => {
  it("should have pending as status after creating", () => {
    const game = new Game()
    expect(game.status).toBe(GameStatuses.pending)
  })
  it("should have in_progress as status after creating", () => {
    const game = new Game()
    game.start()
    expect(game.status).toBe(GameStatuses.in_progress)
  })
  it("google should be in the Grid after start", () => {
    const game = new Game()
    game.start()
    expect(game.googlePosition.x).toBeLessThan(game.gridSize.columnCount)
    expect(game.googlePosition.x).toBeGreaterThanOrEqual(0)
    expect(game.googlePosition.y).toBeLessThan(game.gridSize.rowCount)
    expect(game.googlePosition.y).toBeGreaterThanOrEqual(0)
  })
  it("google should be in the Grid but in new position after jump", async () => {
    const game = new Game()
    game.googleJumpInterval = 10
    game.start()
    const prevGooglePosition = game.googlePosition
    await delay(1000)
    const currentGooglePosition = game.googlePosition
    expect(prevGooglePosition).not.toEqual(currentGooglePosition)
  })
  it("player1, player2 should have unique coordinates", async () => {
    for (let i = 0; i < 10; i++) {
      const game = new Game()
      game.settings = {
        gridSize: {
          columnCount: 2,
          rowCount: 3,
        },
      }

      await game.start()

      expect([1, 2]).toContain(game.player1.position.x)
      expect([1, 2, 3]).toContain(game.player1.position.y)

      expect([1, 2]).toContain(game.player2.position.x)
      expect([1, 2, 3]).toContain(game.player2.position.y)

      expect(!game.player1.position.equals(game.player2.position))
      expect([1, 2]).toContain(game.google.position.x)
      expect([1, 2, 3]).toContain(game.google.position.y)

      expect(
        !game.player1.position.equals(game.player2.position) &&
          !game.player1.position.equals(game.google.position) &&
          !game.player2.position.equals(game.google.position.y),
      ).toBe(true)
    }
  })
})

const delay = () => {
  return new Promise((res) => setTimeout(res, 1000))
}
