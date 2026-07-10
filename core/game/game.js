import {GameStatuses} from '../constants/gameStatuses.js'
import {NumberUtil} from '../utils/numberUtil.js'
import {Position} from '../models/position.js'
import {Player, Google} from '../models/unit.js'

export class Game {
    //Базовые настройки
    #settings = {
        gridSize: {
            columnCount: 4,
            rowCount: 4,
        },
        pointsToWin: 10,
        googleJumpInterval: 5000,
    }

    #gridSizeSettings = [
        {text: '4x4', value: '4x4', rowCount: 4, columnCount: 4},
        {text: '5x5', value: '5x5', rowCount: 5, columnCount: 5},
        {text: '6x6', value: '6x6', rowCount: 6, columnCount: 6},
        {text: '7x7', value: '7x7', rowCount: 7, columnCount: 7},
        {text: '8x8', value: '8x8', rowCount: 8, columnCount: 8},
    ]

    #pointsToWinSettings = [
        {text: '10pts', value: '10pts', pointsToWin: 10},
        {text: '15pts', value: '15pts', pointsToWin: 15},
        {text: '20pts', value: '20pts', pointsToWin: 20},
        {text: '25pts', value: '25pts', pointsToWin: 25},
        {text: '30pts', value: '30pts', pointsToWin: 30},
    ]

    #googleJumpIntervalSettings = [
        {text: '5 sec', value: '5000', googleJumpInterval: 5000},
        {text: '10 sec', value: '10000', googleJumpInterval: 10000},
        {text: '15 sec', value: '15000', googleJumpInterval: 15000},
        {text: '20 sec', value: '20000', googleJumpInterval: 20000},
        {text: '25 sec', value: '25000', googleJumpInterval: 25000},
    ]

    #status = GameStatuses.pending

    #player1
    #player2
    #google

    #callbackProps = {}
    #googleSetIntervalId

    #score = {
        1: {points: 0},
        2: {points: 0},
        google: {jumps: 0},
    }

    #gameTimerIntervalId
    #gameTime = 0

    //Конструктор
    constructor(callbackProps) {
        this.#callbackProps = callbackProps
    }

    //Настройки игры
    set settings(settings) {
        this.#settings = {...this.#settings, ...settings}

        this.#settings.gridSize = settings.gridSize
            ? {...this.#settings.gridSize, ...settings.gridSize}
            : this.#settings.gridSize
    }

    changeGridSize(columnCount, rowCount) {
        if (this.#status !== GameStatuses.pending) return

        this.#settings.gridSize.columnCount = columnCount
        this.#settings.gridSize.rowCount = rowCount
        this.#callbackProps.onChange()
    }

    changePointsToWin(pointsToWin) {
        if (this.#status !== GameStatuses.pending) return

        this.#settings.pointsToWin = pointsToWin
        this.#callbackProps.onChange()
    }

    changeGoogleJumpInterval(googleJumpInterval) {
        if (this.#status !== GameStatuses.pending) return

        this.#settings.googleJumpInterval = googleJumpInterval
        this.#callbackProps.onChange()
    }

    //Геттеры
    get status() {
        return this.#status
    }

    get gridSize() {
        return this.#settings.gridSize
    }

    get gridSizeSettings() {
        return this.#gridSizeSettings
    }

    get pointsToWin() {
        return this.#settings.pointsToWin
    }

    get pointsToWinSettings() {
        return this.#pointsToWinSettings
    }

    get googleJumpInterval() {
        return this.#settings.googleJumpInterval
    }

    get googleJumpIntervalSettings() {
        return this.#googleJumpIntervalSettings
    }

    get googlePosition() {
        return this.#google ? this.#google.position : null
    }

    get player1Position() {
        return this.#player1?.position
    }

    get player2Position() {
        return this.#player2?.position
    }

    get google() {
        return this.#google
    }

    get score() {
        return this.#score
    }

    get winnerPlayerId() {
        if (this.#status !== GameStatuses.finished) {
            return null
        }
        if (this.#score[1].points > this.#score[2].points && this.#score[1].points > this.#score.google.jumps) {
            return 1
        } else if (this.#score[2].points > this.#score[1].points && this.#score[2].points > this.#score.google.jumps) {
            return 2
        } else if (this.#score.google.jumps >= this.#settings.pointsToWin || this.#score.google.jumps > this.#score[2].points && this.#score.google.jumps > this.#score[1].points) {
            return 'Google'
        }

        return 'Draw'
    }

    get gameTime() {
        return this.#gameTime
    }

    //Запуск игры
    startGame() {
        if (this.#status !== GameStatuses.pending) return

        this.#status = GameStatuses.in_progress
        this.#createUnits()
        this.#gameTime = 0
        this.#runGoogleJumpInterval()
        this.#runGameTimer()
        this.#callbackProps.onChange()
    }

    // Создание игровых объектов
    #createUnits() {
        const player1Position = this.#getRandomPosition([])
        this.#player1 = new Player(1, player1Position)

        const player2Position = this.#getRandomPosition([player1Position])
        this.#player2 = new Player(2, player2Position)

        this.#moveGoogleToRandomPosition()
    }

    #getRandomPosition(coordinates) {
        let newX, newY

        do {
            newX = NumberUtil.random(this.#settings.gridSize.columnCount)
            newY = NumberUtil.random(this.#settings.gridSize.rowCount)
        } while (coordinates.some((el) => el.x === newX && el.y === newY))

        return new Position(newX, newY)
    }

    #moveGoogleToRandomPosition() {
        let notCrossedPosition = [this.#player1.position, this.#player2.position]

        if (this.#google) {
            notCrossedPosition.push(this.#google.position)
        }

        this.#google = new Google(this.#getRandomPosition(notCrossedPosition))
    }

    // Запуск интервала прыжков Google
    #runGoogleJumpInterval() {
        if (this.#status !== GameStatuses.in_progress) return
        if (this.#settings.googleJumpInterval === 0) return
        clearInterval(this.#googleSetIntervalId)
        this.#googleSetIntervalId = setInterval(() => {
            this.#score.google.jumps++
            if (this.#score.google.jumps >= this.#settings.pointsToWin) {
                this.finishGame()
                return
            }
            this.#moveGoogleToRandomPosition()
            this.#callbackProps.onChange()
        }, this.#settings.googleJumpInterval)
    }

    //Управление игроками
    movePlayer1Right() {
        const delta = {x: 1}
        this.#movePlayer(this.#player1, this.#player2, delta)
    }

    movePlayer1Left() {
        const delta = {x: -1}
        this.#movePlayer(this.#player1, this.#player2, delta)
    }

    movePlayer1Up() {
        const delta = {y: -1}
        this.#movePlayer(this.#player1, this.#player2, delta)
    }

    movePlayer1Down() {
        const delta = {y: 1}
        this.#movePlayer(this.#player1, this.#player2, delta)
    }

    movePlayer2Right() {
        const delta = {x: 1}
        this.#movePlayer(this.#player2, this.#player1, delta)
    }

    movePlayer2Left() {
        const delta = {x: -1}
        this.#movePlayer(this.#player2, this.#player1, delta)
    }

    movePlayer2Up() {
        const delta = {y: -1}
        this.#movePlayer(this.#player2, this.#player1, delta)
    }

    movePlayer2Down() {
        const delta = {y: 1}
        this.#movePlayer(this.#player2, this.#player1, delta)
    }

    // Общая логика движения
    #movePlayer(movingPlayer, anotherPlayer, delta) {
        if (this.#status !== GameStatuses.in_progress) return

        // стоп таймер на время хода
        clearInterval(this.#googleSetIntervalId)
        const isBorder = this.#checkBorders(movingPlayer, delta)
        const isAnotherPlayer = this.#checkOtherPlayer(movingPlayer, anotherPlayer, delta)
        if (isBorder || isAnotherPlayer) {
            this.#runGoogleJumpInterval() //возврат таймера
            return
        }

        const newPosition = movingPlayer.position.clone()

        if (delta.x !== undefined) newPosition.x += delta.x
        if (delta.y !== undefined) newPosition.y += delta.y

        movingPlayer.position = newPosition

        this.#checkGoogleCatching(movingPlayer)
        this.#runGoogleJumpInterval() //возврат таймера после хода
        this.#callbackProps.onChange()
    }

    //Проверки
    #checkBorders(player, delta) {
        const newPosition = player.position.clone()
        if (delta.x !== undefined) newPosition.x += delta.x
        if (delta.y !== undefined) newPosition.y += delta.y

        if (newPosition.x < 0 || newPosition.x >= this.#settings.gridSize.columnCount) {
            return true
        }
        if (newPosition.y < 0 || newPosition.y >= this.#settings.gridSize.rowCount) {
            return true
        }

        return false
    }

    #checkOtherPlayer(movingPlayer, anotherPlayer, delta) {
        const newPosition = movingPlayer.position.clone()
        if (delta.x !== undefined) newPosition.x += delta.x
        if (delta.y !== undefined) newPosition.y += delta.y

        return anotherPlayer.position.equal(newPosition)
    }

    #checkGoogleCatching(player) {
        if (!player.position.equal(this.#google.position)) {
            return
        }
        //если поймали, то увеличиваем счет
        this.#score[player.id].points += 1

        if (this.#score[player.id].points === this.#settings.pointsToWin) {
            this.finishGame()
        } else {
            this.#moveGoogleToRandomPosition()
        }
    }

    #runGameTimer() {
        if (this.#status !== GameStatuses.in_progress) return
        clearInterval(this.#gameTimerIntervalId)

        this.#gameTimerIntervalId = setInterval(() => {
            this.#gameTime++
            this.#callbackProps.onChange()
        }, 1000)
    }

    //Остановка игры
    stopGame() {
        if (this.#status !== GameStatuses.in_progress) return
        clearInterval(this.#googleSetIntervalId)
        this.#status = GameStatuses.paused
        clearInterval(this.#gameTimerIntervalId)
        this.#callbackProps.onChange()
    }

    resumeGame() {
        if (this.#status !== GameStatuses.paused) return
        this.#status = GameStatuses.in_progress
        this.#runGoogleJumpInterval()
        this.#runGameTimer()
        this.#callbackProps.onChange()
    }

    //Завершение игры
    finishGame() {
        clearInterval(this.#googleSetIntervalId)
        clearInterval(this.#gameTimerIntervalId)
        this.#status = GameStatuses.finished
        this.#callbackProps.onChange()
    }

    restartGame() {
        clearInterval(this.#googleSetIntervalId)
        clearInterval(this.#gameTimerIntervalId)

        this.#score = {
            1: {points: 0},
            2: {points: 0},
            google: {jumps: 0},
        }
        this.#gameTime = 0
        this.#player1 = null
        this.#player2 = null
        this.#google = null

        this.#status = GameStatuses.pending
        this.startGame()
    }

    async getSettings() {
        return this.#settings
    }

    async getStatus() {
        return this.#status
    }

    async getScore() {
        return this.#score
    }

    async getPlayer1() {
        return this.#player1
    }

    async getPlayer2() {
        return this.#player2
    }

    async getGoogle() {
        return this.#google
    }

    async getWinnerPlayerId() {
        return this.winnerPlayerId
    }

    async getGameTime() {
        return this.gameTime
    }
}
