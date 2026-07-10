import {Api} from './Api.js'

export class GameRemoteProxy {
    #callbackProps = {}
    #state = {}

    #socket = null

    constructor(callbackProps) {
        this.#callbackProps = callbackProps
    }

    async start() {
        this.#socket = new WebSocket('ws://localhost:8080');

        await new Promise((resolve) => {
            this.#socket.addEventListener('open', resolve, {once: true});
        })
        this.api = new Api(this.#socket, (state) => {
            this.#state = state
            this.#callbackProps.onChange()
        })
        await this.syncState()
    }

    async changeGridSize(columnCount, rowCount) {
        await this.api.send('changeGridSize', {
            columnCount,
            rowCount,
        })
    }

    async changePointsToWin(pointsToWin) {
        await this.api.send('changePointsToWin', {
            pointsToWin,
        })
    }

    async changeGoogleJumpInterval(googleJumpInterval) {
        await this.api.send('changeGoogleJumpInterval', {
            googleJumpInterval,
        })
    }


    get status() {
        return this.#state.status
    }

    get gridSize() {
        return this.#state.gridSize
    }

    get gridSizeSettings() {
        return this.#state.gridSizeSettings
    }

    get pointsToWin() {
        return this.#state.pointsToWin
    }

    get pointsToWinSettings() {
        return this.#state.pointsToWinSettings
    }

    get googleJumpInterval() {
        return this.#state.googleJumpInterval
    }

    get googleJumpIntervalSettings() {
        return this.#state.googleJumpIntervalSettings
    }

    get googlePosition() {
        return this.#state.google?.position
    }

    get player1Position() {
        return this.#state.player1?.position
    }

    get player2Position() {
        return this.#state.player2?.position
    }

    get google() {
        return this.#state.google
    }

    get winnerPlayerId() {
        return this.#state.winnerPlayerId
    }

    get gameTime() {
        return this.#state.gameTime
    }

    get score() {
        return this.#state.score
    }

    async startGame() {
        await this.api.send('startGame')
    }

    async syncState() {
        this.#state = await this.api.send('getState')
        this.#callbackProps.onChange()
    }

    async movePlayer1Right() {
        await this.api.send('movePlayer1Right')
    }

    async movePlayer1Left() {
        await this.api.send('movePlayer1Left')
    }

    async movePlayer1Up() {
        await this.api.send('movePlayer1Up')
    }

    async movePlayer1Down() {
        await this.api.send('movePlayer1Down')
    }

    async movePlayer2Right() {
        await this.api.send('movePlayer2Right')
    }

    async movePlayer2Left() {
        await this.api.send('movePlayer2Left')
    }

    async movePlayer2Up() {
        await this.api.send('movePlayer2Up')
    }

    async movePlayer2Down() {
        await this.api.send('movePlayer2Down')
    }


    async stopGame() {
        await this.api.send('stopGame')
    }

    async resumeGame() {
        await this.api.send('resumeGame')
    }


    async finishGame() {
        await this.api.send('finishGame')
    }

    async restartGame() {
        await this.api.send('restartGame')
    }
}
