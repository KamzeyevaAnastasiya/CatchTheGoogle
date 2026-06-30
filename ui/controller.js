import { Game } from '../core/game/game.js'

export class Controller {
  constructor(view) {
    this.model = new Game({
      onChange: () => {
        this.#renderView()
      },
    })
    this.view = view
    this.view.setCallbacks({
      onStart: () => {
        this.#startGame()
      },
      onMove: (playerNumber, direction) => {
        if (playerNumber === 1) {
          if (direction === 'up') this.model.movePlayer1Up()
          if (direction === 'down') this.model.movePlayer1Down()
          if (direction === 'left') this.model.movePlayer1Left()
          if (direction === 'right') this.model.movePlayer1Right()
        }
        if (playerNumber === 2) {
          if (direction === 'up') this.model.movePlayer2Up()
          if (direction === 'down') this.model.movePlayer2Down()
          if (direction === 'left') this.model.movePlayer2Left()
          if (direction === 'right') this.model.movePlayer2Right()
        }
      },
      onChangeGridSize: (columnCount, rowCount) => {
        this.#changeGridSize(columnCount, rowCount)
      },
    })
    this.#renderView()
  }

  #startGame() {
    this.model.start()
  }

  #changeGridSize(columnCount, rowCount) {
    this.model.changeGridSize(columnCount, rowCount)
  }

  #renderView() {
    this.view.render({
      status: this.model.status,
      gridSize: this.model.gridSize,
      googlePosition: this.model.googlePosition,
      player1Position: this.model.player1Position,
      player2Position: this.model.player2Position,
      score: this.model.score,
      gridSizeSettings: this.model.gridSizeSettings,
    })
  }
}
