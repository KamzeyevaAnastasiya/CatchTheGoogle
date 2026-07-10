import {Api} from './Api.js'

export class GameRemoteProxy {
    #callbackProps = {}

    #state = {
        status: 'pending',
        gridSize: {
            columnCount: 4,
            rowCount: 4,
        },
        gridSizeSettings: [
            {text: '4x4', value: '4x4', rowCount: 4, columnCount: 4},
            {text: '5x5', value: '5x5', rowCount: 5, columnCount: 5},
            {text: '6x6', value: '6x6', rowCount: 6, columnCount: 6},
            {text: '7x7', value: '7x7', rowCount: 7, columnCount: 7},
            {text: '8x8', value: '8x8', rowCount: 8, columnCount: 8},
        ],
        pointsToWin: 10,
        pointsToWinSettings: [
            {text: '10pts', value: '10pts', pointsToWin: 10},
            {text: '15pts', value: '15pts', pointsToWin: 15},
            {text: '20pts', value: '20pts', pointsToWin: 20},
            {text: '25pts', value: '25pts', pointsToWin: 25},
            {text: '30pts', value: '30pts', pointsToWin: 30},
        ],
        googleJumpInterval: 5000,
        googleJumpIntervalSettings: [
            {text: '5 sec', value: '5000', googleJumpInterval: 5000},
            {text: '10 sec', value: '10000', googleJumpInterval: 10000},
            {text: '15 sec', value: '15000', googleJumpInterval: 15000},
            {text: '20 sec', value: '20000', googleJumpInterval: 20000},
            {text: '25 sec', value: '25000', googleJumpInterval: 25000},
        ],
        player1: null,
        player2: null,
        google: null,
        score: {
            1: {points: 0},
            2: {points: 0},
            google: {jumps: 0},
        },
        winnerPlayerId: null,
        gameTime: 0,

    }

    socket = null

    constructor(callbackProps) {
        this.#callbackProps = callbackProps
    }

    async start() {
        this.socket = new WebSocket('ws://localhost:8080');

        await new Promise((resolve) => {
            this.socket.addEventListener('open', resolve, {once: true});
        })
        this.api = new Api(this.socket, (state) => {
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
