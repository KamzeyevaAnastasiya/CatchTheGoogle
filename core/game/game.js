import {GameStatuses} from './gameStatuses.js'
import {NumberUtil} from '../utils/numberUtil.js'
import {Position} from '../position.js'
import {Player, Google} from '../unit.js'

export class Game {
    //базовые настройки
    #settings = {
        gridSize: {
            columnCount: 4,
            rowCount: 4,
        },
        googleJumpInterval: 2000,
        pointsToWin: 3,
    }

    #gridSizeSettings = [
        {text: "4x4", value: "4x4", rowCount: 4, columnCount: 4},
        {text: "5x5", value: "5x5", rowCount: 5, columnCount: 5},
        {text: "6x6", value: "6x6", rowCount: 6, columnCount: 6},
        {text: "7x7", value: "7x7", rowCount: 7, columnCount: 7},
        {text: "8x8", value: "8x8", rowCount: 8, columnCount: 8},
    ]

    //состояни игры
    #status = GameStatuses.pending
    #player1Position
    #player2Position
    #google
    #callbackProps = {}
    #googleSetIntervalId
    #score = {
        1: {points: 0},
        2: {points: 0},
    }

    //утилита для генерации чисел Google
    constructor(callbackProps) {
        this.#callbackProps = callbackProps
    }

    //настройки игры
    set settings(settings) {
        this.#settings = {...this.#settings, ...settings}

        this.#settings.gridSize = settings.gridSize
            ? {...this.#settings.gridSize, ...settings.gridSize}
            : this.#settings.gridSize
    }

    get settings() {
        return this.#settings
    }

    get status() {
        return this.#status
    }

    get gridSize() {
        return this.#settings.gridSize
    }

    get gridSizeSettings() {
        return this.#gridSizeSettings
    }

    get googlePosition() {
        return this.#google ? this.#google.position : null
    }

    get player1Position() {
        return this.#player1Position?.position
    }

    get player2Position() {
        return this.#player2Position?.position
    }

    get google() {
        return this.#google
    }

    get score() {
        return this.#score
    }

    set googleJumpInterval(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(`Google Jump Interval must be a positive integer`)
        }
        this.#settings.googleJumpInterval = value
    }

    set score(value) {
        this.#score = value
    }

    //генерация несовпадающих позиций
    #getRandomPosition(coordinates) {
        let newX, newY

        do {
            newX = NumberUtil.random(this.#settings.gridSize.columnCount)
            newY = NumberUtil.random(this.#settings.gridSize.rowCount)
        } while (coordinates.some((el) => el.x === newX && el.y === newY))

        return new Position(newX, newY)
    }

    // Создание игроков и Google
    #createUnits() {
        const player1Position = this.#getRandomPosition([])
        this.#player1Position = new Player(1, player1Position)

        const player2Position = this.#getRandomPosition([player1Position])
        this.#player2Position = new Player(2, player2Position)

        this.#moveGoogleToRandomPosition(true)
    }

    #moveGoogleToRandomPosition(excludeGoogle) {
        let notCrossedPosition = [this.#player1Position.position, this.#player2Position.position]

        if (this.#google) {
            notCrossedPosition.push(this.#google.position)
        }

        this.#google = new Google(this.#getRandomPosition(notCrossedPosition))
        this.#callbackProps.onChange()
    }

    // Запуск интервала прыжков Google
    #runGoogleJumpInterval() {
        if (this.#status !== GameStatuses.in_progress) return;
        if (this.#settings.googleJumpInterval === 0) return
        this.#googleSetIntervalId = setInterval(() => {
            this.#moveGoogleToRandomPosition(true)
        }, this.#settings.googleJumpInterval)
    }

    //старт игры
    async start() {
        if (this.#status === GameStatuses.pending) {
            this.#createUnits()
            this.#status = GameStatuses.in_progress
            this.#runGoogleJumpInterval()
        }
    }

    async stop() {
        clearInterval(this.#googleSetIntervalId)
        this.#status = GameStatuses.stoped
    }

    changeGridSize(columnCount, rowCount) {
        if (this.#status === GameStatuses.in_progress) return

        this.#settings.gridSize.columnCount = columnCount
        this.#settings.gridSize.rowCount = rowCount
        this.#callbackProps.onChange();
    }

    #checkBorders(player, delta) {
        const newPosition = player.position.clone()
        if (delta.x) newPosition.x += delta.x
        if (delta.y) newPosition.y += delta.y

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
        if (delta.x) newPosition.x += delta.x
        if (delta.y) newPosition.y += delta.y

        return anotherPlayer.position.equal(newPosition)
    }

    #checkGoogleCatching(player) {
        if (!player.position.equal(this.#google.position)) {
            return
        }
        //если поймали, то увеличиваем счет
        this.#score[player.id].points += 1

        if (this.#score[player.id].points === this.#settings.pointsToWin) {
            this.#finishGame()
        } else {
            this.#moveGoogleToRandomPosition(true)
        }
    }

    movePlayer(movingPlayer, anotherPlayer, delta) {
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

    movePlayer1Right() {
        const delta = {x: 1}
        this.movePlayer(this.#player1Position, this.#player2Position, delta)
    }

    movePlayer1Left() {
        const delta = {x: -1}
        this.movePlayer(this.#player1Position, this.#player2Position, delta)
    }

    movePlayer1Up() {
        const delta = {y: -1}
        this.movePlayer(this.#player1Position, this.#player2Position, delta)
    }

    movePlayer1Down() {
        const delta = {y: 1}
        this.movePlayer(this.#player1Position, this.#player2Position, delta)
    }

    movePlayer2Right() {
        const delta = {x: 1}
        this.movePlayer(this.#player2Position, this.#player1Position, delta)
    }

    movePlayer2Left() {
        const delta = {x: -1}
        this.movePlayer(this.#player2Position, this.#player1Position, delta)
    }

    movePlayer2Up() {
        const delta = {y: -1}
        this.movePlayer(this.#player2Position, this.#player1Position, delta)
    }

    movePlayer2Down() {
        const delta = {y: 1}
        this.movePlayer(this.#player2Position, this.#player1Position, delta)
    }

    async #finishGame() {
        clearInterval(this.#googleSetIntervalId)
        this.#status = GameStatuses.finished
    }
}
