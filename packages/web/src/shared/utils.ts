export function capitalize(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Bound a number into the inclusive range [min, max].
 * @param num The input number.
 * @param min The minimum bound.
 * @param max The maximum bound.
 * @returns A number in the inclusive range [min, max].
 */
export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}
