import { Game } from './game.js'
import { GameStatuses } from './gameStatuses.js'

let game

describe('Game test', () => {
  beforeEach(() => {
    game = new Game()
  })
  afterEach(async () => {
    await game.stopGame()
  })
  it('should have pending as status after creating', () => {
    expect(game.status).toBe(GameStatuses.pending)
  })
  it('should have in_progress as status after creating', async () => {
    await game.startGame()
    expect(game.status).toBe(GameStatuses.in_progress)
  })
  it('google should be in the Grid after startGame', async () => {
    await game.startGame()
    expect(game.googlePosition.x).toBeLessThan(game.gridSize.columnCount)
    expect(game.googlePosition.x).toBeGreaterThanOrEqual(1)
    expect(game.googlePosition.y).toBeLessThan(game.gridSize.rowCount)
    expect(game.googlePosition.y).toBeGreaterThanOrEqual(1)
  })
  it('google should be in the Grid but in new position after jump', async () => {
    game.googleJumpInterval = 10
    await game.startGame()
    const prevGooglePosition = game.googlePosition
    await delay(1000)
    const currentGooglePosition = game.googlePosition
    expect(prevGooglePosition).not.toEqual(currentGooglePosition)
  })
  it('player1, player2 should have unique coordinates', async () => {
    for (let i = 0; i < 10; i++) {
      game.settings = {
        gridSize: {
          columnCount: 2,
          rowCount: 3,
        },
      }

      await game.startGame()

      expect([1, 2]).toContain(game.player1.position.x)
      expect([1, 2, 3]).toContain(game.player1.position.y)

      expect([1, 2]).toContain(game.player2.position.x)
      expect([1, 2, 3]).toContain(game.player2.position.y)

      expect(!game.player1.position.equal(game.player2.position))
      expect([1, 2]).toContain(game.google.position.x)
      expect([1, 2, 3]).toContain(game.google.position.y)

      expect(
        !game.player1.position.equal(game.player2.position) &&
          !game.player1.position.equal(game.google.position) &&
          !game.player2.position.equal(game.google.position),
      ).toBe(true)
    }
  })
  it('check google positions after jump', async () => {
    // setter
    game.settings = {
      gridSize: {
        columnCount: 1,
        rowCount: 4,
      },
      googleJumpInterval: 100,
    }

    await game.startGame()

    const prevPositions = game.google.googlePosition.clone()

    await sleep(150)

    expect(game.google.googlePosition.equal(prevPositions)).toBe(false)
  })
  it('catch google by player1 or player2 for one row', async () => {
    for (let i = 0; i < 10; i++) {
      game = new Game()
      // setter
      game.settings = {
        gridSize: {
          columnCount: 3,
          rowCount: 1,
        },
      }

      await game.startGame()
      // p1 p2 g | p1 g p2 | p2 p1 g | p2 g p1 | g p1 p2 | g p2 p1
      const deltaForPlayer1 = game.google.position.x - game.player1.position.x

      const prevGooglePosition = game.google.position.clone()

      if (Math.abs(deltaForPlayer1) === 2) {
        const deltaForPlayer2 = game.google.position.x - game.player2.position.x
        if (deltaForPlayer2 > 0) game.movePlayer2Right()
        else game.movePlayer2Left()

        expect(game.score[1].points).toBe(0)
        expect(game.score[2].points).toBe(1)
      } else {
        if (deltaForPlayer1 > 0) game.movePlayer1Right()
        else game.movePlayer1Left()

        expect(game.score[1].points).toBe(1)
        expect(game.score[2].points).toBe(0)
      }

      expect(game.google.position.equal(prevGooglePosition)).toBe(false)
    }
  })
  it('catch google by player1 or player2 for one column', async () => {
    for (let i = 0; i < 10; i++) {
      game = new Game()
      // setter
      game.settings = {
        gridSize: {
          columnCount: 1,
          rowCount: 3,
        },
      }

      await game.startGame()

      // p1   p1   p2   p2    g    g
      // p2    g   p1    g   p1   p2
      //  g   p2    g   p1   p2   p1
      const deltaForPlayer1 = game.google.position.y - game.player1.position.y

      const prevGooglePosition = game.google.position.clone()

      if (Math.abs(deltaForPlayer1) === 2) {
        const deltaForPlayer2 = game.google.position.y - game.player2.position.y
        if (deltaForPlayer2 > 0) game.movePlayer2Down()
        else game.movePlayer2Up()

        expect(game.score[1].points).toBe(0)
        expect(game.score[2].points).toBe(1)
      } else {
        if (deltaForPlayer1 > 0) game.movePlayer1Down()
        else game.movePlayer1Up()

        expect(game.score[1].points).toBe(1)
        expect(game.score[2].points).toBe(0)
      }

      expect(game.google.position.equal(prevGooglePosition)).toBe(false)
    }
  })
  it('first or second player wins', async () => {
    // setter
    game.settings = {
      gridSize: {
        columnCount: 3,
        rowCount: 1,
      },
    }
    game.score = {
      1: { points: 0 },
      2: { points: 0 },
    }

    await game.startGame()
    // p1 p2 g | p1 g p2 | p2 p1 g | p2 g p1 | g p1 p2 | g p2 p1
    const deltaForPlayer1 = game.google.position.x - game.player1.position.x

    if (Math.abs(deltaForPlayer1) === 2) {
      const deltaForPlayer2 = game.google.position.x - game.player2.position.x
      if (deltaForPlayer2 > 0) {
        game.movePlayer2Right()
        game.movePlayer2Left()
        game.movePlayer2Right()
      } else {
        game.movePlayer2Left()
        game.movePlayer2Right()
        game.movePlayer2Left()
      }

      expect(game.status).toBe('finished')
      expect(game.score[1].points).toBe(0)
      expect(game.score[2].points).toBe(3)
    } else {
      if (deltaForPlayer1 > 0) {
        game.movePlayer1Right()
        game.movePlayer1Left()
        game.movePlayer1Right()
      } else {
        game.movePlayer1Left()
        game.movePlayer1Right()
        game.movePlayer1Left()
      }

      expect(game.status).toBe('finished')
      expect(game.score[1].points).toBe(3)
      expect(game.score[2].points).toBe(0)
    }
  })
})
const delay = () => {
  return new Promise((res) => setTimeout(res, 1000))
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))
