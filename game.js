import {GameStatuses} from "./gameStatuses.js"
import {GoogleNumberUtility} from "./googleNumberUtility.js"
import {NumberUtil as NumberUtils, NumberUtil} from "./numberUtil.js"
import {Position} from "./position.js"
import {Player, Google} from "./unit.js"

export class Game {
    //базовые настройки
    #settings = {
        gridSize: {
            columnCount: 4,
            rowCount: 4,
        },
        googleJumpInterval: 2000,
    }

    //состояни игры
    #status = GameStatuses.pending
    #player1
    #player2
    #google
    /**
     * @type GoogleNumberUtility //JSDoc
     */
    #numberUtility
    #googleSetIntervalId


    //утилита для генерации чисел Google
    constructor() {
        this.#numberUtility = new GoogleNumberUtility()
    }

    //настройки игры
    set settings(settings) {
        this.#settings = settings
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

    get googlePosition() {
        return this.#google ? this.#google.position : null;
    }

    get player1() {
        return this.#player1
    }

    get player2() {
        return this.#player2
    }

    get google() {
        return this.#google
    }

    set googleJumpInterval(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(`Google Jump Interval must be a positive integer`)
        }
        this.#settings.googleJumpInterval = value
    }

    //генерация несовпадающих позиций
    #getRandomPosition(coordinates) {
        let newX, newY

        do {
            newX = NumberUtils.getRandomNumber(this.#settings.gridSize.columnCount)
            newY = NumberUtils.getRandomNumber(this.#settings.gridSize.rowCount)
        } while (coordinates.some((el) => el.x === newX && el.y === newY))

        return new Position(newX, newY)
    }

    // Создание игроков и Google
    #createUnits() {
        const player1Position = this.#getRandomPosition([])
        this.#player1 = new Player(1, player1Position)

        const player2Position = this.#getRandomPosition([player1Position])
        this.#player2 = new Player(2, player2Position)

        this.#moveGoogleToRandomPosition(true)
    }

    /*    //прыжок гугла
        #jumpGoogle() {
            const newPosition = {
                x: this.#numberUtility.getRandomInt(0, this.#settings.gridSize.columnCount),
                y: this.#numberUtility.getRandomInt(0, this.#settings.gridSize.rowCount),
            }
            if (newPosition.x === this.googlePosition?.x && newPosition.y === this.googlePosition?.y) {
                this.#jumpGoogle()
                return
            }
            this.#googlePosition = newPosition
        }*/

    #moveGoogleToRandomPosition(excludeGoogle) {
        let notCrossedPosition = [this.#player1.position, this.#player2.position];

        if (!excludeGoogle) {
            notCrossedPosition.push(this.#google.googlePosition);
        }

        this.#google = new Google(this.#getRandomPosition(notCrossedPosition));
    }

    // Запуск интервала прыжков Google
    #runGoogleJumpInterval() {
        this.#googleSetIntervalId = setInterval(() => {
            this.#moveGoogleToRandomPosition();
        }, this.#settings.googleJumpInterval);
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
        clearInterval(this.#googleSetIntervalId);
        this.#status = GameStatuses.stoped;
    }
}
