/**
 * Get a random number between a minimum and maximum value
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @returns A random number between the minimum and maximum value
 */
export function getRandomNumber(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1) + minimum)
}
