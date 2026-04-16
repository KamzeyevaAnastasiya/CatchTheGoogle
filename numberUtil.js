export class NumberUtil {
  /**
   * Случайное целое число в диапазоне [min, max)
   * min — включительно
   * max — НЕ включительно
   */
  static randomInt(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('min and max must be integers')
    }
    if (min >= max) {
      throw new Error('min must be less than max')
    }

    return Math.floor(Math.random() * (max - min)) + min
  }

  /**
   * Случайное число от 0 до max-1
   * (шорткат, чтобы не писать каждый раз 0)
   */
  static random(max) {
    return this.randomInt(0, max)
  }
}
