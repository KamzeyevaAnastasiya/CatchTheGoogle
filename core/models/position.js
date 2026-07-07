export class Position {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  equal(other) {
    return this.x === other.x && this.y === other.y
  }

  clone() {
    return new Position(this.x, this.y)
  }
}
