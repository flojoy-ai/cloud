export function countWhere<T>(arr: T[], predicate: (t: T) => boolean): number {
  return arr.reduce((acc, t) => (predicate(t) ? acc + 1 : acc), 0);
}
