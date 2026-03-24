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
        pointsToWin: 10,
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
    #score = {
        1: {points: 0},
        2: {points: 0},
    };

    //утилита для генерации чисел Google
    constructor() {
        this.#numberUtility = new GoogleNumberUtility()
    }

    //настройки игры
    set settings(settings) {
        this.#settings = {...this.#settings, ...settings};

        this.#settings.gridSize = settings.gridSize
            ? {...this.#settings.gridSize, ...settings.gridSize}
            : this.#settings.gridSize;
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

    get score() {
        return this.#score;
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

        this.#moveGoogleToRandomPosition()
    }


    #moveGoogleToRandomPosition(excludeGoogle) {
        let notCrossedPosition = [this.#player1.position, this.#player2.position];

        if (!excludeGoogle && this.#google) {  // НЕ исключаем Google, если excludeGoogle = false
            notCrossedPosition.push(this.#google.position);
        }

        this.#google = new Google(this.#getRandomPosition(notCrossedPosition));
    }

    // Запуск интервала прыжков Google
    #runGoogleJumpInterval() {
        this.#googleSetIntervalId = setInterval(() => {
            this.#moveGoogleToRandomPosition(true);
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

    #checkBorders(player, delta) {
        const newPosition = player.position.clone();
        if (delta.x) newPosition.x += delta.x;
        if (delta.y) newPosition.y += delta.y;

        if (newPosition.x < 0 || newPosition.x > this.#settings.gridSize.columnCount) {
            return true;
        }
        if (newPosition.y < 0 || newPosition.y > this.#settings.gridSize.rowCount) {
            return true;
        }

        return false;
    }

    #checkOtherPlayer(movingPlayer, anotherPlayer, delta) {
        const newPosition = movingPlayer.position.clone();
        if (delta.x) newPosition.x += delta.x;
        if (delta.y) newPosition.y += delta.y;

        return anotherPlayer.position.equal(newPosition);
    }

    #checkGoogleCatching(player) {
        if (player.position.equal(this.#google.position)) {
            this.#score[player.id].points++;

            this.#moveGoogleToRandomPosition()

        }
    }

    #movePlayer(movingPlayer, anotherPlayer, delta) {
        const isBorder = this.#checkBorders(movingPlayer, delta);
        const isAnotherPlayer = this.#checkOtherPlayer(
            movingPlayer,
            anotherPlayer,
            delta
        );
        if (isBorder || isAnotherPlayer) return

        if (delta.x) {
            movingPlayer.position = new Position(
                movingPlayer.position.x + delta.x,
                movingPlayer.position.y,
            );
        } else {
            movingPlayer.position = new Position(
                movingPlayer.position.x,
                movingPlayer.position.y + delta.y,
            );
        }
        this.#checkGoogleCatching(movingPlayer);
    }

    movePlayer1Right() {
        const delta = {x: 1};
        this.#movePlayer(this.#player1, this.#player2, delta);
    }

    movePlayer1Left() {
        const delta = {x: -1};
        this.#movePlayer(this.#player1, this.#player2, delta);
    }

    movePlayer1Up() {
        const delta = {y: -1};
        this.#movePlayer(this.#player1, this.#player2, delta);
    }

    movePlayer1Down() {
        const delta = {y: 1};
        this.#movePlayer(this.#player1, this.#player2, delta);
    }

    movePlayer2Right() {
        const delta = {x: 1};
        this.#movePlayer(this.#player2, this.#player1, delta);
    }

    movePlayer2Left() {
        const delta = {x: -1};
        this.#movePlayer(this.#player2, this.#player1, delta);
    }

    movePlayer2Up() {
        const delta = {y: -1};
        this.#movePlayer(this.#player2, this.#player1, delta);
    }

    movePlayer2Down() {
        const delta = {y: 1};
        this.#movePlayer(this.#player2, this.#player1, delta);
    }


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
