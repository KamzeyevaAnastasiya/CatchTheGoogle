import { GameStatuses } from "./gameStatuses.js"
import { SamuraiNumberUtility } from "./samuraiNumberUtility.js"
import { NumberUtil as NumberUtils, NumberUtil } from "./numberUtil.js"
import { Position } from "./position.js"
import { Player, Google } from "./unit.js"

export class Game {
  #settings = {
    gridSize: {
      columnCount: 4,
      rowCount: 4,
    },
    googleJumpInterval: 1000,
  }

  //состояни игры
  #status = GameStatuses.pending

  #googlePosition = null

  //игроки
  #player1
  #player2

  /**
   * @type SamuraiNumberUtility //JSDoc
   */
  #numberUtility
  #google

  //утилита для генерации чисел
  constructor() {
    this.#numberUtility = new SamuraiNumberUtility()
  }

  set settings(settings) {
    this.#settings = settings
  }

  get settings() {
    return this.#settings
  }

  #getRandomPosition(coordinates) {
    let newX, newY

    do {
      newX = NumberUtils.getRandomNumber(this.#settings.gridSize.columnCount)
      newY = NumberUtils.getRandomNumber(this.#settings.gridSize.rowCount)
    } while (coordinates.some((el) => el.x === newX && el.y === newY))

    return new Position(newX, newY)
  }

  #createUnits() {
    const player1Position = this.#getRandomPosition([])
    this.#player1 = new Player(1, player1Position)

    const player2Position = this.#getRandomPosition([player1Position])
    this.#player2 = new Player(2, player2Position)

    const googlePosition = this.#getRandomPosition([player1Position, player2Position])
    this.#google = new Google(googlePosition)
  }

  //прыжки гугла
  set googleJumpInterval(value) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Google Jump Interval must be a positive integer`)
    }
    this.#settings.googleJumpInterval = value
  }

  //получаем состояние игры
  get status() {
    return this.#status
  }

  get gridSize() {
    return this.#settings.gridSize
  }

  get googlePosition() {
    return this.#googlePosition
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

  //методы
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
  }

  async start() {
    if (this.#status === GameStatuses.pending) {
      this.#createUnits()
      this.#status = GameStatuses.in_progress
      this.#jumpGoogle()

      setInterval(() => {
        this.#jumpGoogle()
      }, this.#settings.googleJumpInterval)
    }
  }
}
