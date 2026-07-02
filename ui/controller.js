import {Game} from '../core/game/game.js'
import {MoveDirections} from "../core/moveDirections.js";

export class Controller {
    constructor(view) {
        this.model = new Game({
            onChange: () => {
                this.#renderView()
            },
        })
        this.view = view
        this.view.setCallbacks({
            onChangeGridSize: (columnCount, rowCount) => {
                this.#changeGridSize(columnCount, rowCount)
            },
            onChangePointsToWin: (pointsToWin) => {
                this.#changePointsToWin(pointsToWin)
            },
            onChangeGoogleJumpInterval: (googleJumpInterval) => {
                this.#changeGoogleJumpInterval(googleJumpInterval)
            },
            onStart: () => {
                this.#startGame()
            },
            onMove: (playerNumber, direction) => {
                if (playerNumber === 1) {
                    if (direction === MoveDirections.UP) this.model.movePlayer1Up()
                    if (direction === MoveDirections.DOWN) this.model.movePlayer1Down()
                    if (direction === MoveDirections.LEFT) this.model.movePlayer1Left()
                    if (direction === MoveDirections.RIGHT) this.model.movePlayer1Right()
                }
                if (playerNumber === 2) {
                    if (direction === MoveDirections.UP) this.model.movePlayer2Up()
                    if (direction === MoveDirections.DOWN) this.model.movePlayer2Down()
                    if (direction === MoveDirections.LEFT) this.model.movePlayer2Left()
                    if (direction === MoveDirections.RIGHT) this.model.movePlayer2Right()
                }
            },
            onStop: () => {
                this.#stopGame()
            },
            onResume: () => {
                this.#resumeGame()
            },
            onFinish: () => {
                this.#finishGame()
            },
        })
        this.#renderView()
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
            pointsToWin: this.model.pointsToWin,
            pointsToWinSettings: this.model.pointsToWinSettings,
            googleJumpInterval: this.model.googleJumpInterval,
            googleJumpIntervalSettings: this.model.googleJumpIntervalSettings,
        })
    }

    #changeGridSize(columnCount, rowCount) {
        this.model.changeGridSize(columnCount, rowCount)
    }

    #changePointsToWin(pointsToWin) {
        this.model.changePointsToWin(pointsToWin)
    }

    #changeGoogleJumpInterval(googleJumpInterval) {
        this.model.changeGoogleJumpInterval(googleJumpInterval)
    }

    #startGame() {
        this.model.start()
    }

    #stopGame() {
        this.model.stop()
    }

    #resumeGame() {
        this.model.resume()
    }

    #finishGame() {
        this.model.finishGame()
    }
}
